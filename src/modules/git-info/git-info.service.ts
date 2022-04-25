import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom, map } from 'rxjs';
import { GitInfoEntity } from 'src/entities';
import { Repository } from 'typeorm';
// import { got } from 'got';`

@Injectable()
export class GitInfoService {
  @Inject()
  private readonly httpService: HttpService;

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
      let { git_url } = createGitInfoDto;
      git_url = this.judgeChildStyle(git_url);

      const gitInfo = await this.gitInfoRepository.create({
        ...createGitInfoDto,
        project_id,
        git_url,
      });
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
      let { git_url } = updateGitInfoDto;
      git_url = this.judgeChildStyle(git_url);
      const gitInfo = await this.gitInfoRepository.save({
        ...updateGitInfoDto,
        git_url,
        id,
      });

      return gitInfo;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   *
   * @param {number} id
   * @returns
   */
  async deleteGitInfo(id) {
    try {
      await this.getGitInfo(id);
      // await app.mysql.query('DELETE FROM git_info WHERE id = ?', [id]);
      await this.gitInfoRepository.delete(id);
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getGitInfoBranches(id) {
    try {
      const info = await this.getGitInfo(id);
      // const { url, git_project_id, token } = info.data;
      const branchs = await this.fetchBranches(info.data);
      return branchs;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 健壮子仓库数据格式
   * @param {object} git_url
   */
  judgeChildStyle(git_url) {
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
  }

  async updateBranchMap(repoBranchesUrl, branchMap) {
    let page = 1;
    let branches = JSON.parse(
      (
        await lastValueFrom(
          this.httpService
            .get(`${repoBranchesUrl}&per_page=100&page=${page}`)
            .pipe(map((res) => res.data)),
        )
      ).body,
    );
    while (branches.length > 0) {
      for (const branch of branches) {
        branchMap[branch.name] = 1;
      }
      if (branches.length === 100) {
        ++page;
        branches = JSON.parse(
          (
            await lastValueFrom(
              this.httpService
                .get(`${repoBranchesUrl}&per_page=100&page=${page}`)
                .pipe(map((res) => res.data)),
            )
          ).body,
        );
      } else {
        break;
      }
    }
  }

  async fetchBranches({ url, git_project_id, token }) {
    const repoBranchesUrl = `${url}/api/v4/projects/${git_project_id}/repository/branches?private_token=${token}`;
    let branches = [];
    const branchMap = {};
    await this.updateBranchMap(repoBranchesUrl, branchMap);
    branches = Object.keys(branchMap);
    return branches;
  }
}
