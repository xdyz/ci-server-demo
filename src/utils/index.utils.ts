import moment from 'moment';

export function convertLevel(level) {
  switch (level) {
    case 0:
      return '普通';
    case 1:
      return {
        color: '#C9BF00',
        value: '警告',
      };
    case 2:
      return {
        color: '#ED1C24',
        value: '严重',
      };
    case 3:
      return {
        color: '#ED1C24',
        value: '致命',
      };
    default:
      return '其他';
  }
}

export function converStatu(level, fixNumber) {
  if (level > 1 && fixNumber > 0) {
    // return {
    //   color: '#ED1C24',
    //   value: '不通过',
    // };
    return 0;
  }

  return 1;
}

/**
 * 安装包管理
 * @param {*} status
 * @returns
 */
// 将jenkins 的处理结果转换成数字
export function convertJenkinsStatusToInt(status) {
  switch (status) {
    case 'IN_PROGRESS':
      return 1;
    case 'SUCCESS':
      return 2;
    case 'UNSTABLE':
      return 2;
    case 'FAILURE':
      return 3;
    case 'ABORTED':
      return 4;
    default:
      return 0;
  }
}

export const buildTypes = {
  CHECK: 'check',
  PACKAGE: 'package',
  SERVER: 'server',
  TEST: 'test',
  EVENT: 'event',
  ASSET_BUNDLE: 'assetBundle',
};

export const checkTypes = [
  {
    type: '纹理检查',
    value: ['WllTextureDetector', 'TextureDetector'],
  },
  {
    type: '模型检查',
    value: ['WllModelDetector', 'ModelDetector'],
  },
  {
    type: '图集检查',
    value: ['SpriteAtlasDetector'],
  },
  {
    type: '材质检查',
    value: ['MaterialDetector'],
  },
  {
    type: '着色器检查',
    value: [],
  },
  {
    type: '预制检查',
    value: ['WllPrefabDetector', 'PrefabDetector'],
  },
  {
    type: '场景检查',
    value: [],
  },
  {
    type: '音频检查',
    value: [],
  },
  {
    type: '特效检查',
    value: ['EffectDetector'],
  },
  {
    type: '文件检查',
    value: [
      'FileFormatDetector',
      'FileDuplicateDetector',
      'NamingRuleDetector',
      'GuidDuplicateDetector',
      'MissingDetector',
    ],
  },
  {
    type: 'C#脚本检查',
    value: [],
  },
  {
    type: '场景检测',
    value: ['ScenesDetector'],
  },
];

// 解析耗时
export function parseDuration(duration, defaultTime?: string) {
  if (duration) {
    if (duration < 1) {
      return `${duration * 1000}ms`;
    }
    if (duration < 60) {
      return `${Math.floor(duration)}s`;
    }
    if (duration < 3600) {
      const m = Math.floor(duration / 60);
      const s = Math.floor(duration - 60 * m);
      return `${m}m${s > 0 ? `${s}s` : ''}`;
    }
    if (duration < 3600 * 24) {
      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration - 3600 * h) / 60);
      return `${h}h${m > 0 ? `${m}m` : ''}`;
    }
    const d = Math.floor(duration / (3600 * 24));
    return `${
      d + parseFloat(((duration - 3600 * 24 * d) / (3600 * 24)).toFixed(1))
    }d`;
  }
  return defaultTime ? '0s' : '';
}

// const moment = require("moment");

export function parseTimeToSeconds({ from, to, ...rest }) {
  const start = moment(from).startOf('day').format('X');
  const end = moment(to).endOf('day').format('X');

  return {
    from: start,
    to: end,
    ...rest,
  };
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
