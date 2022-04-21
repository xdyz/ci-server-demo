import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImManagerEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateNotifyDto } from './dtos/create-notify.dto';
import { UpdateNotifyDto } from './dtos/update-notify.dto';
import got from 'got';
@Injectable()
export class NotifyService {
  @InjectRepository(ImManagerEntity)
  private readonly imManagerRepository: Repository<ImManagerEntity>;

  weixinUrl = 'https://qyapi.weixin.qq.com/cgi-bin';
  access_token = null;
  msgtypeContent = ['text', 'markdown'];
  msgtypeFile = ['image', 'voice', 'video', 'file'];
  curTryGetNum = 0;
  curTryPushNum = 0;
  tryMaxNum = 3;
  tokenErrcodeArr = [40014, 42001];

  // 根据类型来获取通知的信息
  async getIMByType(type) {
    // const [managers] = await app.mysql.query(notifyConstants.SELECT_NOTIFY_BY_TYPE, [type]);
    const manager = await this.imManagerRepository.findOne({ where: { type } });

    return manager;
  }

  /**
   * @param touser 需要通知的人的 姓名 以 | 隔开 的字符串
   * @param msgtype 通知信息类型 例如 text image  file 等等
   * @param content 通知 内容
   */
  async notify({ type, tousers, message }) {
    if (type === 'weixin') {
      await this.weixinNotify(tousers, message);
    } else {
      throw new HttpException('不支持的通知类型', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * @description 获取 access_token 凭证
   * @param corpid 企业ID
   * @param corpsecret 凭证密匙
   */
  refreshToken = async (corpid, corpsecret) => {
    const res = await got.get(
      `${this.weixinUrl}/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`,
    );
    const msg = JSON.parse(res.body);
    if (msg.errcode === 0) {
      this.access_token = msg.access_token;
    } else {
      throw new HttpException(msg.errmsg, HttpStatus.BAD_REQUEST);
    }
  };

  async tryGetMedia(type, formData, corpid, corpsecret) {
    const res = await got.post(
      `${this.weixinUrl}/media/upload?access_token=${this.access_token}&type=${type}`,
      {
        body: formData,
      },
    );
    const msg = JSON.parse(res.body);
    if (msg.errcode === 0) {
      this.curTryGetNum = 0;
      return msg;
    } else {
      this.curTryGetNum++;
      if (this.curTryGetNum > this.tryMaxNum) {
        // app.sentry.captureMessage(msg.errmsg);
        // app.utils.log.error("notifyService.tryGetMedia", msg.errcode, msg.errmsg);
        return msg;
      }
      setTimeout(async () => {
        if (this.tokenErrcodeArr.indexOf(msg.errcode) !== -1) {
          await this.refreshToken(corpid, corpsecret);
        }
        return await this.tryGetMedia(type, formData, corpid, corpsecret);
      }, 3000);
    }
  }

  async weixinNotify(touser, { msgtype, content }) {
    if (![...this.msgtypeContent, ...this.msgtypeFile].includes(msgtype))
      return;
    // 根据类型获取微信通知信息
    const manager = await this.getIMByType('weixin');
    const { corpid, corpsecret, agentid } = manager;
    if (!this.access_token) {
      await this.refreshToken(corpid, corpsecret);
    }

    const pushMsg = {
      touser: touser, // 接收者 多个接收者 以 | 划分
      // toparty: args.toparty, // 部门列表  多个以 | 划分
      // totag: args.totag,
      msgtype: msgtype,
      agentid,
      safe: 0, // 是否是保密消息
      enable_id_trans: 0, // 是否开启id 转译
      enable_duplicate_check: 0, // 是否开启重复消息检查
      duplicate_check_interval: 1800, // 重复消息检查的时间间隔
    };

    // 如果是 文本类型 直接文本通知即可
    if (this.msgtypeContent.includes(msgtype)) {
      pushMsg[msgtype] = { content: content };
    }

    // 如果是文件，语音类的数据，需要先上传临时文件，然后拿到media_id 后 发送
    if (this.msgtypeFile.includes(msgtype)) {
      // 获取media_id
      const formData = new FormData();
      formData.append('file', content);
      const uploadRes = await this.tryGetMedia(
        msgtype,
        formData,
        corpid,
        corpsecret,
      );
      pushMsg[msgtype] = { media_id: uploadRes.media_id };
    }
    await this.tryPushMsg(pushMsg, corpid, corpsecret);
  }

  async tryPushMsg(pushMsg, corpid, corpsecret) {
    const res = await got.post(
      `${this.weixinUrl}/message/send?access_token=${this.access_token}`,
      { json: pushMsg },
    );
    const msg = JSON.parse(res.body);
    if (msg.errcode === 0) {
      this.curTryPushNum = 0;
      return;
    } else {
      this.curTryPushNum++;
      if (this.curTryPushNum > this.tryMaxNum) {
        // app.sentry.captureMessage(msg.errmsg);
        // app.utils.log.error("notifyService.tryPushMsg", msg.errcode, msg.errmsg);
        return;
      }
      setTimeout(async () => {
        if (this.tokenErrcodeArr.indexOf(msg.errcode) !== -1) {
          await this.refreshToken(corpid, corpsecret);
        }
        await this.tryPushMsg(pushMsg, corpid, corpsecret);
      }, 3000);
    }
  }

  async getOneIMById(id) {
    // const [chats] = await app.mysql.query(notifyConstants.SELECT_NOTIFY_BY_ID, [id]);
    const chat = await this.imManagerRepository.findOne({ id });
    return chat;
  }

  async getAllIMManagers() {
    // const [chats] = await app.mysql.query(notifyConstants.SELECT_NOTIFY_NO_CONDITION);
    const chats = await this.imManagerRepository.find();

    return chats;
  }

  async insertChat(createImManagerDto) {
    try {
      const chat = await this.imManagerRepository.create(createImManagerDto);
      const result = await this.imManagerRepository.save(chat);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateChat(id, updateImManagerDto) {
    try {
      const result = await this.imManagerRepository.save({
        id,
        ...updateImManagerDto,
      });
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async delChat(id) {
    try {
      await this.imManagerRepository.delete({ id });
      return {};
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
