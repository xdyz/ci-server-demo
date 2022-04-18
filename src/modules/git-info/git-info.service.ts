import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GitInfoEntity } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class GitInfoService {
  @InjectRepository(GitInfoEntity)
  private readonly gitInfoRepository: Repository<GitInfoEntity>;
  /**
   * 查询单个仓库是否存在，如果不存在，则直接报错。如果存在就返回
   * @param {number} id
   * @returns
   */
  async getGitInfo(id) {
    const gitInfo = await this.gitInfoRepository.findOne(id);
    return {
      data: gitInfo,
    };
  }

  /**
   * 查询单个仓库是否存在，如果不存在，则直接报错。如果存在就返回
   * @param {number} project_id, ssh
   * @returns
   */
  async getGitInfoBySSH(project_id, ssh) {
    const gitInfo = await this.gitInfoRepository.findOne({
      where: {
        project_id,
        ssh,
      },
    });

    // const [git_infos] = await app.mysql.query(gitInfoConstants.SELECT_GIT_INFO_BY_PROJECT_ID_SSH, [project_id, ssh]);
    // return git_infos[0];

    return gitInfo;
  }

  /**
   * 查询所有的仓库
   * @returns
   */
  async getGitInfos({ project_id }) {
    const gitInfos = await this.gitInfoRepository.find({
      where: {
        project_id,
      },
    });

    // const [git_infos] = await app.mysql.query(gitInfoConstants.SELECT_GIT_INFO_BY_PROJECT_ID, [project_id]);
    return {
      data: gitInfos,
    };
  }

  /**
   * 新增
   * @param {* is string} { name, url, git_project_id, tag, token, }
   * @returns
   */
  // { name, url, git_project_id, tag, token, ssh, git_url = {} }
  async createGitInfo({ project_id }, createGitInfoDto) {
    try {
      let { git_url, ...rest } = createGitInfoDto;
      git_url = this.judgeChildStyle(git_url);

      const gitInfo = await this.gitInfoRepository.create({ git_url, ...rest });
      const result = await this.gitInfoRepository.save(gitInfo);

      return {
        data: result,
      };
    } catch (error) {}
  }

  /**
   * 更新
   * @param {number}} id
   * @param {* is sting} { name, url, git_project_id, tag, token, }
   * @returns
   */
  async updateGitInfo(id, updateGitInfoDto) {
    try {
      await this.getGitInfo(id);
      let { git_url, ...rest } = updateGitInfoDto;
      git_url = this.judgeChildStyle(git_url);
      const gitInfo = await this.gitInfoRepository.save({
        git_url,
        ...rest,
        id,
      });

      return {
        data: gitInfo,
      };
    } catch (error) {
      app.sentry.captureException(error);
    }
  }

  /**
   *
   * @param {number} id
   * @returns
   */
  async deleteGitInfo(id) {
    await this.getGitInfo(id);
    // await app.mysql.query('DELETE FROM git_info WHERE id = ?', [id]);
    await this.gitInfoRepository.delete(id);
    return {};
  }

  async getGitInfoBranches(id) {
    const info = await this.getGitInfo(id);
    // const { url, git_project_id, token } = info.data;
    const branchs = await utils.getBranches(info.data);
    return {
      data: branchs,
    };
  }

  /**
   * 健壮子仓库数据格式
   * @param {object} git_url
   */
  judgeChildStyle = (git_url) => {
    if (!git_url) {
      return {};
    }
    const child = git_url.child;
    if (!child) {
      return git_url;
    }
    const len = child.length;
    let newLen;
    let j;
    const newChild = [];
    for (let i = 0; i < len; ++i) {
      const oneChild = child[i];
      const oneRelativePath = oneChild.relative_path;
      const oneRelativePathLen = oneRelativePath.length;
      if (oneRelativePath[oneRelativePathLen - 1] !== '/') {
        oneChild.relative_path += '/';
      }

      let minSeparatorNum = 9999;
      let curJ = -1;
      let curSeparatorNum = 0;
      j = 0;
      newLen = newChild.length;
      for (; j < newLen; ++j) {
        const newOneChild = newChild[j];
        const index = newOneChild.relative_path.indexOf(oneChild.relative_path);
        if (index === 0) {
          // 以 '/' 的数量判断深度
          curSeparatorNum = oneChild.relative_path.split('/').length - 1;
          if (curSeparatorNum < minSeparatorNum) {
            minSeparatorNum = curSeparatorNum;
            curJ = j;
          }
        }
      }
      if (curJ === -1) {
        newChild.push(oneChild);
      } else {
        newChild.splice(curJ, 0, oneChild);
      }
    }
    git_url.child = newChild;
    return git_url;
  };
}
