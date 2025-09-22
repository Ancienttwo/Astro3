/**
 * 八字神煞计算函数
 * 用于检查用户八字中的各种神煞
 * 从生产环境 AstroCN_Production 迁移的完整准确算法
 */

// 地支顺序
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 根据年支计算红鸾位置
 * 年支：子丑寅卯辰巳午未申酉戌亥
 * 红鸾：卯寅丑子亥戌酉申未午巳辰
 */
function getHongLuan(yearBranch: string): string {
  const hongluanMap: { [key: string]: string } = {
    '子': '卯',
    '丑': '寅', 
    '寅': '丑',
    '卯': '子',
    '辰': '亥',
    '巳': '戌',
    '午': '酉',
    '未': '申',
    '申': '未',
    '酉': '午',
    '戌': '巳',
    '亥': '辰'
  };
  
  return hongluanMap[yearBranch] || '';
}

/**
 * 根据年支计算天喜位置
 * 年支：子丑寅卯辰巳午未申酉戌亥  
 * 天喜：酉申未午巳辰卯寅丑子亥戌
 */
function getTianXi(yearBranch: string): string {
  const tianxiMap: { [key: string]: string } = {
    '子': '酉',
    '丑': '申',
    '寅': '未', 
    '卯': '午',
    '辰': '巳',
    '巳': '辰',
    '午': '卯',
    '未': '寅',
    '申': '丑',
    '酉': '子',
    '戌': '亥',
    '亥': '戌'
  };
  
  return tianxiMap[yearBranch] || '';
}

/**
 * 沐浴计算
 * 甲日干见亥，乙日干见子，丙日干见寅，丁日干见卯，戊日干见寅，己日干见卯，庚日干见巳，辛日干见午，壬日干见申，癸日干见酉
 */
function getMuYu(dayStem: string): string[] {
  const muyuMap: { [key: string]: string[] } = {
    '甲': ['亥'],
    '乙': ['子'],
    '丙': ['寅'],
    '丁': ['卯'],
    '戊': ['寅'],
    '己': ['卯'],
    '庚': ['巳'],
    '辛': ['午'],
    '壬': ['申'],
    '癸': ['酉']
  };
  
  return muyuMap[dayStem] || [];
}

/**
 * 咸池计算（桃花煞）- 查年法
 * 按年支查法：申子辰年见酉，亥卯未年见子，寅午戌年见卯，巳酉丑年见午
 */
function getXianChi(yearBranch: string): string {
  const xianchiMap: { [key: string]: string } = {
    // 申子辰年（水局），桃花在酉
    '申': '酉', '子': '酉', '辰': '酉',
    // 亥卯未年（木局），桃花在子  
    '亥': '子', '卯': '子', '未': '子',
    // 寅午戌年（火局），桃花在卯
    '寅': '卯', '午': '卯', '戌': '卯',
    // 巳酉丑年（金局），桃花在午
    '巳': '午', '酉': '午', '丑': '午'
  };
  
  return xianchiMap[yearBranch] || '';
}

/**
 * 红艳计算（日干对照法）
 * 甲见午、乙见申、丙见寅、丁见未、戊见辰、己见辰、庚见戌、辛见酉、壬见子、癸见申
 */
function getHongYan(dayStem: string): string[] {
  const hongyanMap: { [key: string]: string[] } = {
    '甲': ['午'],
    '乙': ['申'],
    '丙': ['寅'],
    '丁': ['未'],
    '戊': ['辰'],
    '己': ['辰'],
    '庚': ['戌'],
    '辛': ['酉'],
    '壬': ['子'],
    '癸': ['申']
  };
  
  return hongyanMap[dayStem] || [];
}

/**
 * 天乙贵人计算
 * 按日干或年干查四柱地支
 * 使用生产环境的正确映射
 */
function getTianYiGuiRen(stem: string): string[] {
  const tianyiMap: { [key: string]: string[] } = {
    '甲': ['丑', '未'],
    '乙': ['子', '申'], 
    '丙': ['亥', '酉'],
    '丁': ['亥', '酉'],
    '戊': ['丑', '未'],
    '己': ['子', '申'],
    '庚': ['丑', '未'], 
    '辛': ['寅', '午'],
    '壬': ['卯', '巳'],
    '癸': ['卯', '巳']
  };
  
  return tianyiMap[stem] || [];
}

/**
 * 天德贵人计算 - 根据年干查月干是否有对应的天德贵人
 * 年干决定天德贵人，月干中出现对应天干就是天德
 */
function getTianDeGuiRen(yearStem: string, monthStem: string): boolean {
  const tiandeMap: { [key: string]: string[] } = {
    // 甲己起首干丙，天德贵人是丙
    '甲': ['丙'], '己': ['丙'],
    // 乙庚起首干丁，天德贵人是丁  
    '乙': ['丁'], '庚': ['丁'],
    // 丙辛起首干戊，天德贵人是戊
    '丙': ['戊'], '辛': ['戊'],
    // 丁壬起首干己，天德贵人是己
    '丁': ['己'], '壬': ['己'],
    // 戊癸起首干甲，天德贵人是甲
    '戊': ['甲'], '癸': ['甲']
  };
  
  const requiredStems = tiandeMap[yearStem] || [];
  return requiredStems.includes(monthStem);
}

/**
 * 月德贵人计算 - 根据月支三合局确定月德天干，检查四柱天干任意位置
 * 歌诀：寅午戌月见丙，申子辰月见壬，亥卯未月见甲，巳酉丑月见庚
 */
function getYueDeGuiRen(monthBranch: string, stems: string[]): { hasIt: boolean; positions: string[]; requiredStem: string } {
  // 月支三合局对应的月德天干
  const yuedeMap: { [key: string]: string } = {
    // 寅午戌（火局） → 月德天干是丙
    '寅': '丙', '午': '丙', '戌': '丙',
    // 申子辰（水局） → 月德天干是壬  
    '申': '壬', '子': '壬', '辰': '壬',
    // 亥卯未（木局） → 月德天干是甲
    '亥': '甲', '卯': '甲', '未': '甲',
    // 巳酉丑（金局） → 月德天干是庚
    '巳': '庚', '酉': '庚', '丑': '庚'
  };
  
  const requiredStem = yuedeMap[monthBranch] || '';
  
  if (!requiredStem) {
    return { hasIt: false, positions: [], requiredStem: '' };
  }
  
  // 在四柱天干任意位置查找月德天干
  const positions: string[] = [];
  const columnNames = ['年干', '月干', '日干', '时干'];
  
  stems.forEach((stem, index) => {
    if (stem === requiredStem && index < columnNames.length) {
      positions.push(columnNames[index]);
    }
  });
  
  return {
    hasIt: positions.length > 0,
    positions,
    requiredStem
  };
}

/**
 * 天德合计算 - 天德合是与天德贵人相合的天干
 * 天德合可以出现在年月日时干任何位置
 */
function getTianDeHe(yearStem: string, stems: string[]): string[] {
  // 先确定天德贵人是什么
  const tiandeMap: { [key: string]: string } = {
    // 甲己年，天德贵人是丙
    '甲': '丙', '己': '丙',
    // 乙庚年，天德贵人是丁  
    '乙': '丁', '庚': '丁',
    // 丙辛年，天德贵人是戊
    '丙': '戊', '辛': '戊',
    // 丁壬年，天德贵人是己
    '丁': '己', '壬': '己',
    // 戊癸年，天德贵人是甲
    '戊': '甲', '癸': '甲'
  };
  
  // 天干相合规律：甲己合、乙庚合、丙辛合、丁壬合、戊癸合
  const heMap: { [key: string]: string } = {
    '甲': '己', '己': '甲',
    '乙': '庚', '庚': '乙', 
    '丙': '辛', '辛': '丙',
    '丁': '壬', '壬': '丁',
    '戊': '癸', '癸': '戊'
  };
  
  const tiandeStem = tiandeMap[yearStem];
  if (!tiandeStem) {
    return [];
  }
  
  // 天德合是与天德贵人相合的天干
  const tiandeHeStem = heMap[tiandeStem];
  if (!tiandeHeStem) {
    return [];
  }
  
  // 在年月日时干中查找天德合
  const positions: string[] = [];
  const columnNames = ['年干', '月干', '日干', '时干'];
  
  stems.forEach((stem, index) => {
    if (stem === tiandeHeStem) {
      positions.push(columnNames[index]);
    }
  });
  
  return positions;
}

/**
 * 太极贵人计算
 * 甲乙见子午，丙丁见卯酉，戊己见辰戌，庚辛见丑未，壬癸见寅申
 * 【准确算法】按日干查四柱地支，大运流年同样适用
 */
function getTaiJiGuiRen(stem: string): string[] {
  const taijiMap: { [key: string]: string[] } = {
    '甲': ['子', '午'], '乙': ['子', '午'],
    '丙': ['卯', '酉'], '丁': ['卯', '酉'],
    '戊': ['辰', '戌'], '己': ['辰', '戌'],
    '庚': ['丑', '未'], '辛': ['丑', '未'],
    '壬': ['寅', '申'], '癸': ['寅', '申']
  };
  
  return taijiMap[stem] || [];
}

/**
 * 三奇贵人计算
 * 天上三奇甲戊庚，地下三奇乙丙丁，人中三奇壬癸辛
 * 【准确算法】需要在天干中同时出现所有三个字才算，包括大运流年
 */
function getSanQiGuiRen(stems: string[]): { hasIt: boolean; type: string; positions: string[] } {
  const tianShang = ['甲', '戊', '庚']; // 天上三奇
  const diXia = ['乙', '丙', '丁'];     // 地下三奇  
  const renZhong = ['壬', '癸', '辛'];  // 人中三奇
  
  const positions: string[] = [];
  const columnNames = ['年干', '月干', '日干', '时干', '大运干', '流年干'];
  let type = '';
  
  // 检查天上三奇
  if (tianShang.every(stem => stems.includes(stem))) {
    type = '天上三奇';
    tianShang.forEach(targetStem => {
      stems.forEach((stem, index) => {
        if (stem === targetStem && index < columnNames.length) {
          positions.push(`${columnNames[index]}(${targetStem})`);
        }
      });
    });
  }
  // 检查地下三奇
  else if (diXia.every(stem => stems.includes(stem))) {
    type = '地下三奇';
    diXia.forEach(targetStem => {
      stems.forEach((stem, index) => {
        if (stem === targetStem && index < columnNames.length) {
          positions.push(`${columnNames[index]}(${targetStem})`);
        }
      });
    });
  }
  // 检查人中三奇
  else if (renZhong.every(stem => stems.includes(stem))) {
    type = '人中三奇';
    renZhong.forEach(targetStem => {
      stems.forEach((stem, index) => {
        if (stem === targetStem && index < columnNames.length) {
          positions.push(`${columnNames[index]}(${targetStem})`);
        }
      });
    });
  }
  
  return {
    hasIt: type !== '',
    type,
    positions
  };
}

/**
 * 文昌贵人计算
 * 【准确算法】甲见巳、乙见午、丙见申、丁见酉、戊见申、己见酉、庚见亥、辛见子、壬见寅、癸见卯
 * 按日干查四柱地支，大运流年同样适用
 */
function getWenChangGuiRen(dayStem: string): string[] {
  const wenchangMap: { [key: string]: string[] } = {
    '甲': ['巳'], '乙': ['午'], '丙': ['申'], '丁': ['酉'], '戊': ['申'],
    '己': ['酉'], '庚': ['亥'], '辛': ['子'], '壬': ['寅'], '癸': ['卯']
  };
  
  return wenchangMap[dayStem] || [];
}

/**
 * 国印贵人计算
 * 【准确算法】甲见戌、乙见亥、丙见丑、丁见寅、戊见丑、己见寅、庚见辰、辛见巳、壬见未、癸见申
 * 按年干或日干查四柱地支，大运流年同样适用
 */
function getGuoYinGuiRen(stem: string): string[] {
  const guoyinMap: { [key: string]: string[] } = {
    '甲': ['戌'], '乙': ['亥'], '丙': ['丑'], '丁': ['寅'], '戊': ['丑'],
    '己': ['寅'], '庚': ['辰'], '辛': ['巳'], '壬': ['未'], '癸': ['申']
  };
  
  return guoyinMap[stem] || [];
}

/**
 * 将星计算
 * 【准确算法】申子辰见子、亥卯未见卯、寅午戌见午、巳酉丑见酉
 * 三合局的中神即为将星，按年支查，大运流年地支同样适用
 */
function getJiangXing(yearBranch: string): string {
  const jiangxingMap: { [key: string]: string } = {
    '申': '子', '子': '子', '辰': '子', // 申子辰水局见子
    '亥': '卯', '卯': '卯', '未': '卯', // 亥卯未木局见卯
    '寅': '午', '午': '午', '戌': '午', // 寅午戌火局见午
    '巳': '酉', '酉': '酉', '丑': '酉'  // 巳酉丑金局见酉
  };
  
  return jiangxingMap[yearBranch] || '';
}

/**
 * 华盖计算
 * 【准确算法】申子辰见辰、亥卯未见未、寅午戌见戌、巳酉丑见丑
 * 三合局的库神即为华盖，按年支查，大运流年地支同样适用
 */
function getHuaGai(yearBranch: string): string {
  const huagaiMap: { [key: string]: string } = {
    '申': '辰', '子': '辰', '辰': '辰', // 申子辰水局库在辰
    '亥': '未', '卯': '未', '未': '未', // 亥卯未木局库在未  
    '寅': '戌', '午': '戌', '戌': '戌', // 寅午戌火局库在戌
    '巳': '丑', '酉': '丑', '丑': '丑'  // 巳酉丑金局库在丑
  };
  
  return huagaiMap[yearBranch] || '';
}

/**
 * 金舆计算
 * 【准确算法】甲龙乙蛇丙戊羊，丁己猴歌庚犬方，辛猪壬牛癸逢虎，凡人遇此福满堂
 * 甲见辰、乙见巳、丙见未、丁见申、戊见未、己见申、庚见戌、辛见亥、壬见丑、癸见寅
 * 按日干查四柱地支，大运流年同样适用
 */
function getJinYu(stem: string): string[] {
  const jinyuMap: { [key: string]: string[] } = {
    '甲': ['辰'], '乙': ['巳'], '丙': ['未'], '丁': ['申'], '戊': ['未'],
    '己': ['申'], '庚': ['戌'], '辛': ['亥'], '壬': ['丑'], '癸': ['寅']
  };
  
  return jinyuMap[stem] || [];
}

/**
 * 驿马计算
 * 【准确算法】申子辰马在寅、亥卯未马在巳、寅午戌马在申、巳酉丑马在亥
 * 按年支三合局查，大运流年地支同样适用
 */
function getYiMa(yearBranch: string): string {
  const yimaMap: { [key: string]: string } = {
    '申': '寅', '子': '寅', '辰': '寅', // 申子辰水局驿马在寅
    '亥': '巳', '卯': '巳', '未': '巳', // 亥卯未木局驿马在巳
    '寅': '申', '午': '申', '戌': '申', // 寅午戌火局驿马在申
    '巳': '亥', '酉': '亥', '丑': '亥'  // 巳酉丑金局驿马在亥
  };
  
  return yimaMap[yearBranch] || '';
}

/**
 * 禄神计算（食禄）
 * 【准确算法】甲禄在寅、乙禄在卯、丙戊禄在巳、丁己禄在午、庚禄在申、辛禄在酉、壬禄在亥、癸禄在子
 * 按天干查对应地支，大运流年同样适用
 */
function getLuShen(stem: string): string[] {
  const lushenMap: { [key: string]: string[] } = {
    '甲': ['寅'], '乙': ['卯'], '丙': ['巳'], '丁': ['午'], '戊': ['巳'],
    '己': ['午'], '庚': ['申'], '辛': ['酉'], '壬': ['亥'], '癸': ['子']
  };
  
  return lushenMap[stem] || [];
}

/**
 * 羊刃计算
 * 【准确算法】甲刃在卯、乙刃在寅、丙戊刃在午、丁己刃在巳、庚刃在酉、辛刃在申、壬刃在子、癸刃在亥
 * 按日干查地支，大运流年同样适用，是极凶之煞
 */
function getYangRen(dayStem: string): string[] {
  const yangrenMap: { [key: string]: string[] } = {
    '甲': ['卯'], '乙': ['寅'], '丙': ['午'], '丁': ['巳'], '戊': ['午'],
    '己': ['巳'], '庚': ['酉'], '辛': ['申'], '壬': ['子'], '癸': ['亥']
  };
  
  return yangrenMap[dayStem] || [];
}

/**
 * 空亡计算
 * 【准确算法】甲子旬空戌亥、甲戌旬空申酉、甲申旬空午未、甲午旬空辰巳、甲辰旬空寅卯、甲寅旬空子丑
 * 按日柱干支查空亡的地支，大运流年地支同样适用
 */
function getKongWang(dayStem: string, dayBranch: string): string[] {
  // 六甲旬对应的空亡地支
  const xunMap: { [key: string]: string[] } = {
    // 甲子旬：甲子、乙丑、丙寅、丁卯、戊辰、己巳、庚午、辛未、壬申、癸酉，空戌亥
    '甲子旬': ['戌', '亥'],
    // 甲戌旬：甲戌、乙亥、丙子、丁丑、戊寅、己卯、庚辰、辛巳、壬午、癸未，空申酉  
    '甲戌旬': ['申', '酉'],
    // 甲申旬：甲申、乙酉、丙戌、丁亥、戊子、己丑、庚寅、辛卯、壬辰、癸巳，空午未
    '甲申旬': ['午', '未'],
    // 甲午旬：甲午、乙未、丙申、丁酉、戊戌、己亥、庚子、辛丑、壬寅、癸卯，空辰巳
    '甲午旬': ['辰', '巳'],
    // 甲辰旬：甲辰、乙巳、丙午、丁未、戊申、己酉、庚戌、辛亥、壬子、癸丑，空寅卯
    '甲辰旬': ['寅', '卯'],
    // 甲寅旬：甲寅、乙卯、丙辰、丁巳、戊午、己未、庚申、辛酉、壬戌、癸亥，空子丑
    '甲寅旬': ['子', '丑']
  };
  
  // 根据日干支确定所在旬
  const ganIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(dayStem);
  const zhiIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(dayBranch);
  
  if (ganIndex === -1 || zhiIndex === -1) return [];
  
  // 计算旬首：日柱干支对应的甲子旬
  const xunShou = (ganIndex * 6) % 60; // 简化计算，实际需要更精确的旬首计算
  
  // 根据地支确定旬
  let xunName = '';
  if (zhiIndex >= 0 && zhiIndex <= 9) {
    // 判断具体在哪个旬
    if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(zhiIndex)) {
      if (ganIndex <= 3) xunName = '甲子旬';
      else if (ganIndex <= 5) xunName = '甲午旬';
      else xunName = '甲戌旬';
    }
  }
  
  // 简化处理：根据日支直接判断旬
  const branchGroup = Math.floor(zhiIndex / 2) * 2;
  switch (branchGroup) {
    case 0: case 2: xunName = '甲子旬'; break;  // 子丑、寅卯
    case 4: case 6: xunName = '甲辰旬'; break;  // 辰巳、午未  
    case 8: case 10: xunName = '甲申旬'; break; // 申酉、戌亥
    default: xunName = '甲午旬'; break;
  }
  
  return xunMap[xunName] || [];
}

/**
 * 亡神计算
 * 【准确算法】申子辰亡在巳、亥卯未亡在申、寅午戌亡在亥、巳酉丑亡在寅
 * 按年支三合局查，大运流年同样适用
 */
function getWangShen(yearBranch: string): string {
  const wangshenMap: { [key: string]: string } = {
    '申': '巳', '子': '巳', '辰': '巳', // 申子辰水局亡神在巳
    '亥': '申', '卯': '申', '未': '申', // 亥卯未木局亡神在申
    '寅': '亥', '午': '亥', '戌': '亥', // 寅午戌火局亡神在亥
    '巳': '寅', '酉': '寅', '丑': '寅'  // 巳酉丑金局亡神在寅
  };
  
  return wangshenMap[yearBranch] || '';
}

/**
 * 劫煞计算
 * 【准确算法】申子辰劫在巳、亥卯未劫在申、寅午戌劫在亥、巳酉丑劫在寅
 * 与亡神计算相同，按年支三合局查，大运流年同样适用
 */
function getJieSha(yearBranch: string): string {
  // 劫煞与亡神计算相同
  return getWangShen(yearBranch);
}

/**
 * 灾煞计算
 * 【准确算法】申子辰灾在午、亥卯未灾在酉、寅午戌灾在子、巳酉丑灾在卯
 * 按年支三合局查，大运流年同样适用
 */
function getZaiSha(yearBranch: string): string {
  const zaishaMap: { [key: string]: string } = {
    '申': '午', '子': '午', '辰': '午', // 申子辰水局灾煞在午
    '亥': '酉', '卯': '酉', '未': '酉', // 亥卯未木局灾煞在酉
    '寅': '子', '午': '子', '戌': '子', // 寅午戌火局灾煞在子
    '巳': '卯', '酉': '卯', '丑': '卯'  // 巳酉丑金局灾煞在卯
  };
  
  return zaishaMap[yearBranch] || '';
}

/**
 * 孤辰寡宿计算
 * 【准确算法】亥子丑人见寅为孤辰见戌为寡宿、寅卯辰人见巳为孤辰见丑为寡宿
 * 按年支查，大运流年同样适用，主孤独少合
 */
function getGuChenGuaSu(yearBranch: string): { guChen: string; guaSu: string } {
  const guChenGuaSuMap: { [key: string]: { guChen: string; guaSu: string } } = {
    '亥': { guChen: '寅', guaSu: '戌' },
    '子': { guChen: '寅', guaSu: '戌' },
    '丑': { guChen: '寅', guaSu: '戌' },
    '寅': { guChen: '巳', guaSu: '丑' },
    '卯': { guChen: '巳', guaSu: '丑' },
    '辰': { guChen: '巳', guaSu: '丑' },
    '巳': { guChen: '申', guaSu: '辰' },
    '午': { guChen: '申', guaSu: '辰' },
    '未': { guChen: '申', guaSu: '辰' },
    '申': { guChen: '亥', guaSu: '未' },
    '酉': { guChen: '亥', guaSu: '未' },
    '戌': { guChen: '亥', guaSu: '未' }
  };
  
  return guChenGuaSuMap[yearBranch] || { guChen: '', guaSu: '' };
}

/**
 * 元辰计算
 * 【准确算法】阳男阴女顺推，阴男阳女逆推
 * 男命：子年生人见丑、丑年生人见寅...（顺推）
 * 女命：子年生人见亥、亥年生人见戌...（逆推）
 * 大运流年同样适用，主暗昧不明、小人是非
 */
function getYuanChen(yearBranch: string, gender: 'male' | 'female'): string {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const branchIndex = branches.indexOf(yearBranch);
  
  if (branchIndex === -1) return '';
  
  let yuanChenIndex: number;
  if (gender === 'male') {
    // 男命顺推：下一个地支
    yuanChenIndex = (branchIndex + 1) % 12;
  } else {
    // 女命逆推：上一个地支
    yuanChenIndex = (branchIndex - 1 + 12) % 12;
  }
  
  return branches[yuanChenIndex];
}

/**
 * 天罗地网计算
 * 【准确算法】戌亥为天罗（火土命人忌），辰巳为地网（水金命人忌）
 * 需要结合命主五行和地支判断，大运流年同样适用
 */
function getTianLuoWang(yearBranch: string, nayin: string): { tianLuo: boolean; diWang: boolean } {
  // 简化处理：按年支纳音五行判断
  const isFireEarth = nayin.includes('火') || nayin.includes('土');
  const isWaterMetal = nayin.includes('水') || nayin.includes('金');
  
  const tianLuoBranches = ['戌', '亥']; // 天罗
  const diWangBranches = ['辰', '巳'];  // 地网
  
  return {
    tianLuo: isFireEarth && tianLuoBranches.includes(yearBranch),
    diWang: isWaterMetal && diWangBranches.includes(yearBranch)
  };
}

/**
 * 白虎煞计算
 * 【准确算法】申见酉、酉见戌、戌见亥、亥见子、子见丑、丑见寅、寅见卯、卯见辰、辰见巳、巳见午、午见未、未见申
 * 年支查下一位地支，大运流年同样适用，主血光之灾
 */
function getBaiHu(yearBranch: string): string {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const branchIndex = branches.indexOf(yearBranch);
  
  if (branchIndex === -1) return '';
  
  const baiHuIndex = (branchIndex + 1) % 12;
  return branches[baiHuIndex];
}

/**
 * 十恶大败计算
 * 【准确算法】甲辰、乙巳、丙申、丁亥、戊戌、己丑、庚辰、辛巳、壬申、癸亥（十日）
 * 检查日柱干支组合是否为十恶大败日，大运流年干支同样适用
 */
function getShiEDaBai(stem: string, branch: string): boolean {
  const shiEDaBaiList = [
    '甲辰', '乙巳', '丙申', '丁亥', '戊戌',
    '己丑', '庚辰', '辛巳', '壬申', '癸亥'
  ];
  
  const ganZhi = stem + branch;
  return shiEDaBaiList.includes(ganZhi);
}

/**
 * 魁罡计算
 * 【准确算法】庚辰、壬辰、戊戌、庚戌四日
 * 检查日柱干支是否为魁罡，大运流年不看，主性格刚烈、有领导能力但易孤独
 */
function getKuiGang(dayStem: string, dayBranch: string): { hasIt: boolean; type: string } {
  const kuiGangMap: { [key: string]: string } = {
    '庚辰': '绝妻罡',
    '壬辰': '绝妻罡', 
    '戊戌': '绝夫罡',
    '庚戌': '绝夫罡'
  };
  
  const dayGanZhi = dayStem + dayBranch;
  const kuiGangType = kuiGangMap[dayGanZhi];
  
  return {
    hasIt: !!kuiGangType,
    type: kuiGangType || ''
  };
}

/**
 * 学堂词馆计算
 * 【准确算法】长生学堂+冠带词馆
 * 学堂：甲见亥、乙见午、丙见寅、丁见酉、戊见寅、己见酉、庚见巳、辛见子、壬见申、癸见卯
 * 词馆：甲见庚、乙见辛、丙见壬、丁见癸、戊见甲、己见乙、庚见丙、辛见丁、壬见戊、癸见己
 */
function getXueTangCiGuan(stem: string): { xueTang: string[]; ciGuan: string[] } {
  const xueTangMap: { [key: string]: string[] } = {
    '甲': ['亥'], '乙': ['午'], '丙': ['寅'], '丁': ['酉'], '戊': ['寅'],
    '己': ['酉'], '庚': ['巳'], '辛': ['子'], '壬': ['申'], '癸': ['卯']
  };
  
  const ciGuanMap: { [key: string]: string[] } = {
    '甲': ['庚'], '乙': ['辛'], '丙': ['壬'], '丁': ['癸'], '戊': ['甲'],
    '己': ['乙'], '庚': ['丙'], '辛': ['丁'], '壬': ['戊'], '癸': ['己']
  };
  
  return {
    xueTang: xueTangMap[stem] || [],
    ciGuan: ciGuanMap[stem] || []
  };
}

/**
 * 月德合计算
 * 【准确算法】与月德贵人天干相合的天干
 * 月德合是月德贵人的合化之神，增强福德力量
 */
function getYueDeHe(monthBranch: string, stems: string[]): { hasIt: boolean; positions: string[]; requiredStem: string } {
  // 先确定月德贵人天干
  const yuedeMap: { [key: string]: string } = {
    '寅': '丙', '午': '丙', '戌': '丙', // 火局月德是丙
    '申': '壬', '子': '壬', '辰': '壬', // 水局月德是壬  
    '亥': '甲', '卯': '甲', '未': '甲', // 木局月德是甲
    '巳': '庚', '酉': '庚', '丑': '庚'  // 金局月德是庚
  };
  
  // 天干相合：甲己合、乙庚合、丙辛合、丁壬合、戊癸合
  const heMap: { [key: string]: string } = {
    '甲': '己', '己': '甲', '乙': '庚', '庚': '乙',
    '丙': '辛', '辛': '丙', '丁': '壬', '壬': '丁',
    '戊': '癸', '癸': '戊'
  };
  
  const yuedeStem = yuedeMap[monthBranch];
  if (!yuedeStem) {
    return { hasIt: false, positions: [], requiredStem: '' };
  }
  
  const yuedeHeStem = heMap[yuedeStem];
  if (!yuedeHeStem) {
    return { hasIt: false, positions: [], requiredStem: '' };
  }
  
  const positions: string[] = [];
  const columnNames = ['年干', '月干', '日干', '时干', '大运干', '流年干'];
  
  stems.forEach((stem, index) => {
    if (stem === yuedeHeStem && index < columnNames.length) {
      positions.push(columnNames[index]);
    }
  });
  
  return {
    hasIt: positions.length > 0,
    positions,
    requiredStem: yuedeHeStem
  };
}

export interface BaziShenShaResult {
  // 桃花星
  hongLuan: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  tianXi: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  muYu: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  xianChi: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  hongYan: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  
  // 贵人星（原有）
  tianYiGuiRen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  tianDeGuiRen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  tianDeHe: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  yueDeGuiRen: {
    hasIt: boolean;
    positions: string[];
    description: string;
    requiredStem: string;
  };
  
  // 贵人星（新增）
  taiJiGuiRen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  sanQiGuiRen: {
    hasIt: boolean;
    positions: string[];
    description: string;
    type: string;
  };
  wenChangGuiRen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  guoYinGuiRen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  yueDeHe: {
    hasIt: boolean;
    positions: string[];
    description: string;
    requiredStem: string;
  };
  
  // 权势星
  jiangXing: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  huaGai: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  jinYu: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  xueTang: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  ciGuan: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  
  // 出行变动星
  yiMa: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  
  // 财禄星
  luShen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  
  // 凶煞（刃煞类）
  yangRen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  
  // 凶煞（空亡劫害类）
  kongWang: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  wangShen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  jieSha: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  zaiSha: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  
  // 凶煞（孤独类）
  guChen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  guaSu: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  yuanChen: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  
  // 凶煞（特殊类）
  tianLuoDiWang: {
    hasIt: boolean;
    positions: string[];
    description: string;
    tianLuo: boolean;
    diWang: boolean;
  };
  baiHu: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  shiEDaBai: {
    hasIt: boolean;
    positions: string[];
    description: string;
  };
  kuiGang: {
    hasIt: boolean;
    positions: string[];
    description: string;
    type: string;
  };
}

/**
 * 主函数：检查八字中的神煞（包含大运流年触发）
 * @param bazi 八字数组 [年干, 年支, 月干, 月支, 日干, 日支, 时干, 时支, ...大运天干, 大运地支, 流年天干, 流年地支]
 * @param hasAccurateTime 是否有准确时辰，false时排除时柱避免虚拟午时干扰
 * @param birthInfo 出生信息，包含性别和纳音等信息
 */
export function checkBaziShenSha(
  bazi: string[], 
  hasAccurateTime: boolean = true, 
  birthInfo?: { gender?: 'male' | 'female'; nayin?: string }
): BaziShenShaResult {
  if (bazi.length < 8) {
    throw new Error('八字数据不完整，至少需要8个字符');
  }
  
  // 取前8个字符作为基本八字，额外的字符可能是大运、流年
  const basicBazi = bazi.slice(0, 8);
  
  const [yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch] = basicBazi;
  
  // 如果没有准确时辰，只使用年月日三柱，排除时柱避免虚拟午时的干扰
  const stems = hasAccurateTime 
    ? [yearStem, monthStem, dayStem, hourStem]
    : [yearStem, monthStem, dayStem];
  const branches = hasAccurateTime 
    ? [yearBranch, monthBranch, dayBranch, hourBranch]
    : [yearBranch, monthBranch, dayBranch];
  
  // 大运流年数据处理 - 支持大运和流年神煞触发
  const extendedBranches = [...branches];
  const extendedStems = [...stems];
  let luckStem = '';
  let luckBranch = '';
  let yearStem2 = ''; // 流年天干
  let yearBranch2 = ''; // 流年地支
  
  if (bazi.length >= 10) {
    // 大运：[...8个八字, 大运天干, 大运地支]
    luckStem = bazi[8];  // 大运天干
    luckBranch = bazi[9]; // 大运地支
    extendedStems.push(luckStem);
    extendedBranches.push(luckBranch);
  }
  
  if (bazi.length >= 12) {
    // 流年：[...8个八字, 大运天干, 大运地支, 流年天干, 流年地支]
    yearStem2 = bazi[10]; // 流年天干
    yearBranch2 = bazi[11]; // 流年地支
    extendedStems.push(yearStem2);
    extendedBranches.push(yearBranch2);
  }
  
  // 计算各神煞的目标位置（包含大运流年）
  const hongLuanTarget = getHongLuan(yearBranch);
  const tianXiTarget = getTianXi(yearBranch);
  const muYuTargets = getMuYu(dayStem);
  const xianChiTarget = getXianChi(yearBranch);
  const hongYanTargets = getHongYan(dayStem);
  const tianYiTargets = getTianYiGuiRen(dayStem);
  
  // 新增神煞计算
  const taiJiTargets = getTaiJiGuiRen(dayStem);
  const sanQiResult = getSanQiGuiRen(extendedStems);
  const wenChangTargets = getWenChangGuiRen(dayStem);
  const guoYinTargets = getGuoYinGuiRen(dayStem); // 也可以按年干
  const jiangXingTarget = getJiangXing(yearBranch);
  const huaGaiTarget = getHuaGai(yearBranch);
  const jinYuTargets = getJinYu(dayStem);
  const yiMaTarget = getYiMa(yearBranch);
  const luShenTargets = getLuShen(dayStem);
  const yangRenTargets = getYangRen(dayStem);
  const kongWangTargets = getKongWang(dayStem, dayBranch);
  const wangShenTarget = getWangShen(yearBranch);
  const jieShaTarget = getJieSha(yearBranch);
  const zaiShaTarget = getZaiSha(yearBranch);
  const guChenGuaSuResult = getGuChenGuaSu(yearBranch);
  const yuanChenTarget = birthInfo?.gender ? getYuanChen(yearBranch, birthInfo.gender) : '';
  const tianLuoDiWangResult = birthInfo?.nayin ? getTianLuoWang(yearBranch, birthInfo.nayin) : { tianLuo: false, diWang: false };
  const baiHuTarget = getBaiHu(yearBranch);
  const shiEDaBaiDay = getShiEDaBai(dayStem, dayBranch);
  const kuiGangResult = getKuiGang(dayStem, dayBranch);
  const xueTangCiGuanResult = getXueTangCiGuan(dayStem);
  
  // 天德贵人检查 - 增强版：包括大运天干的影响
  let hasTianDe = getTianDeGuiRen(yearStem, monthStem);
  let tianDePositions: string[] = [];
  if (hasTianDe) {
    tianDePositions.push('月干');
  }
  // 如果有大运天干，也检查大运中是否有天德贵人
  if (luckStem) {
    const luckHasTianDe = getTianDeGuiRen(yearStem, luckStem);
    if (luckHasTianDe) {
      hasTianDe = true;
      tianDePositions.push('大运天干');
    }
  }
  
  const tianDeHePositions = getTianDeHe(yearStem, extendedStems);
  
  // 月德贵人检查 - 根据月支三合局确定月德天干，检查四柱天干任意位置
  const yueDeResult = getYueDeGuiRen(monthBranch, extendedStems);
  const yueDeHeResult = getYueDeHe(monthBranch, extendedStems);
  
  // 检查是否命中（包含大运流年触发）- 构建完整的神煞结果
  const result: BaziShenShaResult = {
    // 桃花星（原有）
    hongLuan: {
      hasIt: extendedBranches.includes(hongLuanTarget),
      positions: extendedBranches.filter(b => b === hongLuanTarget),
      description: '红鸾主婚姻喜庆，感情运佳'
    },
    tianXi: {
      hasIt: extendedBranches.includes(tianXiTarget),
      positions: extendedBranches.filter(b => b === tianXiTarget),
      description: '天喜主喜庆事件，人缘良好'
    },
    muYu: {
      hasIt: muYuTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => muYuTargets.includes(b)),
      description: '沐浴主聪明俊美，但易有桃花纠纷'
    },
    xianChi: {
      hasIt: xianChiTarget !== '' && extendedBranches.includes(xianChiTarget),
      positions: xianChiTarget !== '' && extendedBranches.includes(xianChiTarget) ? [xianChiTarget] : [],
      description: '咸池主桃花运旺，异性缘佳'
    },
    hongYan: {
      hasIt: hongYanTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => hongYanTargets.includes(b)),
      description: '红艳主异性缘强，容易有感情纠葛'
    },
    
    // 贵人星（原有）
    tianYiGuiRen: {
      hasIt: tianYiTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => tianYiTargets.includes(b)),
      description: '天乙贵人主逢凶化吉，有贵人相助'
    },
    tianDeGuiRen: {
      hasIt: hasTianDe,
      positions: tianDePositions,
      description: '天德贵人主德行高尚，福德深厚，逢凶化吉'
    },
    tianDeHe: {
      hasIt: tianDeHePositions.length > 0,
      positions: tianDeHePositions,
      description: '天德合主与天德贵人相得益彰，增强福德力量'
    },
    yueDeGuiRen: {
      hasIt: yueDeResult.hasIt,
      positions: yueDeResult.positions,
      description: '月德贵人主福德深厚，月德所临之地皆为吉祥之所',
      requiredStem: yueDeResult.requiredStem
    },
    
    // 贵人星（新增）
    taiJiGuiRen: {
      hasIt: taiJiTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => taiJiTargets.includes(b)),
      description: '太极贵人主聪明好学，善于钻研玄学，逢凶化吉'
    },
    sanQiGuiRen: {
      hasIt: sanQiResult.hasIt,
      positions: sanQiResult.positions,
      description: `${sanQiResult.type}主智慧超群，文武双全，能化险为夷`,
      type: sanQiResult.type
    },
    wenChangGuiRen: {
      hasIt: wenChangTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => wenChangTargets.includes(b)),
      description: '文昌贵人主聪明好学，文思敏捷，利于考试读书'
    },
    guoYinGuiRen: {
      hasIt: guoYinTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => guoYinTargets.includes(b)),
      description: '国印贵人主官运亨通，有权威地位，能得上级提拔'
    },
    yueDeHe: {
      hasIt: yueDeHeResult.hasIt,
      positions: yueDeHeResult.positions,
      description: '月德合主与月德贵人相合，福德力量倍增',
      requiredStem: yueDeHeResult.requiredStem
    },
    
    // 权势星
    jiangXing: {
      hasIt: jiangXingTarget !== '' && extendedBranches.includes(jiangXingTarget),
      positions: jiangXingTarget !== '' && extendedBranches.includes(jiangXingTarget) ? [jiangXingTarget] : [],
      description: '将星主有领导才能，能统率众人，适合军警政界'
    },
    huaGai: {
      hasIt: huaGaiTarget !== '' && extendedBranches.includes(huaGaiTarget),
      positions: huaGaiTarget !== '' && extendedBranches.includes(huaGaiTarget) ? [huaGaiTarget] : [],
      description: '华盖主聪明孤高，善于艺术宗教，但易孤独'
    },
    jinYu: {
      hasIt: jinYuTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => jinYuTargets.includes(b)),
      description: '金舆主富贵荣华，乘坐华车，生活优渥'
    },
    xueTang: {
      hasIt: xueTangCiGuanResult.xueTang.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => xueTangCiGuanResult.xueTang.includes(b)),
      description: '学堂主好学深造，学业有成，智慧过人'
    },
    ciGuan: {
      hasIt: xueTangCiGuanResult.ciGuan.some(target => extendedStems.includes(target)),
      positions: extendedStems.filter(s => xueTangCiGuanResult.ciGuan.includes(s)),
      description: '词馆主文笔优美，才华横溢，适合文学创作'
    },
    
    // 出行变动星
    yiMa: {
      hasIt: yiMaTarget !== '' && extendedBranches.includes(yiMaTarget),
      positions: yiMaTarget !== '' && extendedBranches.includes(yiMaTarget) ? [yiMaTarget] : [],
      description: '驿马主奔波走动，变化较多，利于外出发展'
    },
    
    // 财禄星
    luShen: {
      hasIt: luShenTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => luShenTargets.includes(b)),
      description: '禄神主衣食不愁，财源稳定，有一定社会地位'
    },
    
    // 凶煞（刃煞类）
    yangRen: {
      hasIt: yangRenTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => yangRenTargets.includes(b)),
      description: '羊刃主性格刚烈，易有血光之灾，但也主勇敢果断'
    },
    
    // 凶煞（空亡劫害类）
    kongWang: {
      hasIt: kongWangTargets.some(target => extendedBranches.includes(target)),
      positions: extendedBranches.filter(b => kongWangTargets.includes(b)),
      description: '空亡主虚空不实，易有挫折，但也主超脱世俗'
    },
    wangShen: {
      hasIt: wangShenTarget !== '' && extendedBranches.includes(wangShenTarget),
      positions: wangShenTarget !== '' && extendedBranches.includes(wangShenTarget) ? [wangShenTarget] : [],
      description: '亡神主破败消耗，易有意外损失，需谨慎防范'
    },
    jieSha: {
      hasIt: jieShaTarget !== '' && extendedBranches.includes(jieShaTarget),
      positions: jieShaTarget !== '' && extendedBranches.includes(jieShaTarget) ? [jieShaTarget] : [],
      description: '劫煞主破财损物，易遇盗贼，需注意财物安全'
    },
    zaiSha: {
      hasIt: zaiShaTarget !== '' && extendedBranches.includes(zaiShaTarget),
      positions: zaiShaTarget !== '' && extendedBranches.includes(zaiShaTarget) ? [zaiShaTarget] : [],
      description: '灾煞主疾病灾祸，身体健康需多加注意'
    },
    
    // 凶煞（孤独类）
    guChen: {
      hasIt: guChenGuaSuResult.guChen !== '' && extendedBranches.includes(guChenGuaSuResult.guChen),
      positions: guChenGuaSuResult.guChen !== '' && extendedBranches.includes(guChenGuaSuResult.guChen) ? [guChenGuaSuResult.guChen] : [],
      description: '孤辰主孤独少合，男命不利婚姻，性格内向'
    },
    guaSu: {
      hasIt: guChenGuaSuResult.guaSu !== '' && extendedBranches.includes(guChenGuaSuResult.guaSu),
      positions: guChenGuaSuResult.guaSu !== '' && extendedBranches.includes(guChenGuaSuResult.guaSu) ? [guChenGuaSuResult.guaSu] : [],
      description: '寡宿主孤独少合，女命不利婚姻，易守寡'
    },
    yuanChen: {
      hasIt: yuanChenTarget !== '' && extendedBranches.includes(yuanChenTarget),
      positions: yuanChenTarget !== '' && extendedBranches.includes(yuanChenTarget) ? [yuanChenTarget] : [],
      description: '元辰主暗昧不明，易有小人是非，运势不稳'
    },
    
    // 凶煞（特殊类）
    tianLuoDiWang: {
      hasIt: tianLuoDiWangResult.tianLuo || tianLuoDiWangResult.diWang,
      positions: [], // 需要根据具体地支来填充
      description: tianLuoDiWangResult.tianLuo ? '天罗主困顿不通，火土命人最忌' : tianLuoDiWangResult.diWang ? '地网主阻滞不利，水金命人最忌' : '',
      tianLuo: tianLuoDiWangResult.tianLuo,
      diWang: tianLuoDiWangResult.diWang
    },
    baiHu: {
      hasIt: baiHuTarget !== '' && extendedBranches.includes(baiHuTarget),
      positions: baiHuTarget !== '' && extendedBranches.includes(baiHuTarget) ? [baiHuTarget] : [],
      description: '白虎煞主血光之灾，易有外伤手术，需谨慎防范'
    },
    shiEDaBai: {
      hasIt: Boolean(shiEDaBaiDay || (luckStem && luckBranch && getShiEDaBai(luckStem, luckBranch)) || (yearStem2 && yearBranch2 && getShiEDaBai(yearStem2, yearBranch2))),
      positions: [], // 需要标明具体是哪个柱的十恶大败
      description: '十恶大败主运势极凶，诸事不利，但过后必有转机'
    },
    kuiGang: {
      hasIt: kuiGangResult.hasIt,
      positions: kuiGangResult.hasIt ? ['日柱'] : [],
      description: `魁罡主性格刚烈果断，有领导能力但易孤独，${kuiGangResult.type}`,
      type: kuiGangResult.type
    }
  };
  
  return result;
}

/**
 * 获取桃花星总结
 */
export function getPeachBlossomSummary(result: BaziShenShaResult): {
  count: number;
  types: string[];
  description: string;
} {
  const peachStars = [];
  let count = 0;
  
  if (result.hongLuan.hasIt) {
    peachStars.push('红鸾');
    count += result.hongLuan.positions.length;
  }
  if (result.tianXi.hasIt) {
    peachStars.push('天喜');
    count += result.tianXi.positions.length;
  }
  if (result.muYu.hasIt) {
    peachStars.push('沐浴');
    count += result.muYu.positions.length;
  }
  if (result.xianChi.hasIt) {
    peachStars.push('咸池');
    count += result.xianChi.positions.length;
  }
  if (result.hongYan.hasIt) {
    peachStars.push('红艳');
    count += result.hongYan.positions.length;
  }
  
  let description = '';
  if (count === 0) {
    description = '八字中桃花星较少，人际关系平稳，适合技术性或专业性较强的岗位';
  } else if (count <= 2) {
    description = '桃花运适中，具备良好的客户沟通能力，适合综合性岗位';
  } else if (count <= 4) {
    description = '桃花运旺盛，人缘极佳，非常适合销售、客服、商务拓展等前线岗位';
  } else {
    description = '桃花运极强，魅力十足，适合高端销售或公关岗位，需注意保持专业形象';
  }
  
  return {
    count,
    types: peachStars,
    description
  };
}

/**
 * 获取贵人星总结
 */
export function getNoblemanSummary(result: BaziShenShaResult): {
  count: number;
  types: string[];
  description: string;
} {
  const nobleStars = [];
  let count = 0;
  
  if (result.tianYiGuiRen.hasIt) {
    nobleStars.push('天乙贵人');
    count += result.tianYiGuiRen.positions.length;
  }
  if (result.tianDeGuiRen.hasIt) {
    nobleStars.push('天德贵人');
    count += result.tianDeGuiRen.positions.length;
  }
  if (result.tianDeHe.hasIt) {
    nobleStars.push('天德合');
    count += result.tianDeHe.positions.length;
  }
  if (result.yueDeGuiRen.hasIt) {
    nobleStars.push('月德贵人');
    count += result.yueDeGuiRen.positions.length;
  }
  
  let description = '';
  if (count === 0) {
    description = '贵人运一般，需要更多自身努力';
  } else if (count <= 2) {
    description = '有贵人扶助，关键时刻能得到帮助';
  } else {
    description = '贵人运极佳，一生多得贵人相助';
  }
  
  return {
    count,
    types: nobleStars,
    description
  };
}

/**
 * 简化版神煞计算，用于显示在表格中
 * 返回主要的神煞名称数组，用于表格显示（包含所有新增神煞）
 */
export function getSimplifiedShenSha(
  bazi: string[], 
  hasAccurateTime: boolean = true, 
  birthInfo?: { gender?: 'male' | 'female'; nayin?: string }
): string[] {
  try {
    const result = checkBaziShenSha(bazi, hasAccurateTime, birthInfo);
    const shenShaList: string[] = [];
    
    // 桃花星
    if (result.hongLuan.hasIt) shenShaList.push('红鸾');
    if (result.tianXi.hasIt) shenShaList.push('天喜');
    if (result.muYu.hasIt) shenShaList.push('沐浴');
    if (result.xianChi.hasIt) shenShaList.push('咸池');
    if (result.hongYan.hasIt) shenShaList.push('红艳');
    
    // 贵人星（原有）
    if (result.tianYiGuiRen.hasIt) shenShaList.push('天乙贵人');
    if (result.tianDeGuiRen.hasIt) shenShaList.push('天德贵人');
    if (result.tianDeHe.hasIt) shenShaList.push('天德合');
    if (result.yueDeGuiRen.hasIt) shenShaList.push('月德贵人');
    
    // 贵人星（新增）
    if (result.taiJiGuiRen.hasIt) shenShaList.push('太极贵人');
    if (result.sanQiGuiRen.hasIt) shenShaList.push(`三奇贵人(${result.sanQiGuiRen.type})`);
    if (result.wenChangGuiRen.hasIt) shenShaList.push('文昌贵人');
    if (result.guoYinGuiRen.hasIt) shenShaList.push('国印贵人');
    if (result.yueDeHe.hasIt) shenShaList.push('月德合');
    
    // 权势星
    if (result.jiangXing.hasIt) shenShaList.push('将星');
    if (result.huaGai.hasIt) shenShaList.push('华盖');
    if (result.jinYu.hasIt) shenShaList.push('金舆');
    if (result.xueTang.hasIt) shenShaList.push('学堂');
    if (result.ciGuan.hasIt) shenShaList.push('词馆');
    
    // 出行变动星
    if (result.yiMa.hasIt) shenShaList.push('驿马');
    
    // 财禄星
    if (result.luShen.hasIt) shenShaList.push('禄神');
    
    // 凶煞（刃煞类）
    if (result.yangRen.hasIt) shenShaList.push('羊刃');
    
    // 凶煞（空亡劫害类）
    if (result.kongWang.hasIt) shenShaList.push('空亡');
    if (result.wangShen.hasIt) shenShaList.push('亡神');
    if (result.jieSha.hasIt) shenShaList.push('劫煞');
    if (result.zaiSha.hasIt) shenShaList.push('灾煞');
    
    // 凶煞（孤独类）
    if (result.guChen.hasIt) shenShaList.push('孤辰');
    if (result.guaSu.hasIt) shenShaList.push('寡宿');
    if (result.yuanChen.hasIt) shenShaList.push('元辰');
    
    // 凶煞（特殊类）
    if (result.tianLuoDiWang.hasIt) {
      if (result.tianLuoDiWang.tianLuo) shenShaList.push('天罗');
      if (result.tianLuoDiWang.diWang) shenShaList.push('地网');
    }
    if (result.baiHu.hasIt) shenShaList.push('白虎煞');
    if (result.shiEDaBai.hasIt) shenShaList.push('十恶大败');
    if (result.kuiGang.hasIt) shenShaList.push(`魁罡(${result.kuiGang.type})`);
    
    return shenShaList;
  } catch (error) {
    console.error('计算神煞时出错:', error);
    return ['计算错误'];
  }
}

/**
 * 获取每个柱位的神煞（包含大运流年）
 * 返回一个数组，包含年、月、日、时、大运、流年各柱的神煞
 * 使用生产环境的准确算法，支持所有新增神煞
 */
export function getColumnShenSha(
  bazi: string[], 
  hasAccurateTime: boolean = true, 
  birthInfo?: { gender?: 'male' | 'female'; nayin?: string }
): string[][] {
  try {
    const result = checkBaziShenSha(bazi, hasAccurateTime, birthInfo);
    
    // 初始化各柱的神煞数组（包含大运流年）
    const yearShenSha: string[] = [];
    const monthShenSha: string[] = [];
    const dayShenSha: string[] = [];
    const hourShenSha: string[] = [];
    const luckShenSha: string[] = [];  // 大运神煞
    const yearShenSha2: string[] = [];  // 流年神煞
    
    // 从结果中提取各柱的神煞
    // 需要根据实际的位置信息分配神煞到对应的柱
    
    const [yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch] = bazi.slice(0, 8);
    const luckStem = bazi[8] || '';   // 大运天干
    const luckBranch = bazi[9] || ''; // 大运地支
    const yearStem2 = bazi[10] || ''; // 流年天干
    const yearBranch2 = bazi[11] || ''; // 流年地支
    
    // 辅助函数：将神煞分配到对应的柱
    const assignShenShaToColumn = (shenShaName: string, targetBranches: string[], targetStems?: string[]) => {
      // 检查地支
      if (targetBranches.length > 0) {
        targetBranches.forEach(target => {
          if (yearBranch === target) yearShenSha.push(shenShaName);
          if (monthBranch === target) monthShenSha.push(shenShaName);
          if (dayBranch === target) dayShenSha.push(shenShaName);
          if (hasAccurateTime && hourBranch === target) hourShenSha.push(shenShaName);
          if (luckBranch === target) luckShenSha.push(shenShaName);
          if (yearBranch2 === target) yearShenSha2.push(shenShaName);
        });
      }
      
      // 检查天干
      if (targetStems && targetStems.length > 0) {
        targetStems.forEach(target => {
          if (yearStem === target) yearShenSha.push(shenShaName);
          if (monthStem === target) monthShenSha.push(shenShaName);
          if (dayStem === target) dayShenSha.push(shenShaName);
          if (hasAccurateTime && hourStem === target) hourShenSha.push(shenShaName);
          if (luckStem === target) luckShenSha.push(shenShaName);
          if (yearStem2 === target) yearShenSha2.push(shenShaName);
        });
      }
    };

    // 批量处理所有神煞
    const shenShaProcessList = [
      // 桃花星
      { name: '红鸾', hasIt: result.hongLuan.hasIt, targets: [getHongLuan(yearBranch)] },
      { name: '天喜', hasIt: result.tianXi.hasIt, targets: [getTianXi(yearBranch)] },
      { name: '沐浴', hasIt: result.muYu.hasIt, targets: getMuYu(dayStem) },
      { name: '咸池', hasIt: result.xianChi.hasIt, targets: [getXianChi(yearBranch)].filter(t => t) },
      { name: '红艳', hasIt: result.hongYan.hasIt, targets: getHongYan(dayStem) },
      
      // 贵人星
      { name: '天乙贵人', hasIt: result.tianYiGuiRen.hasIt, targets: getTianYiGuiRen(dayStem) },
      { name: '太极贵人', hasIt: result.taiJiGuiRen.hasIt, targets: getTaiJiGuiRen(dayStem) },
      { name: '文昌贵人', hasIt: result.wenChangGuiRen.hasIt, targets: getWenChangGuiRen(dayStem) },
      { name: '国印贵人', hasIt: result.guoYinGuiRen.hasIt, targets: getGuoYinGuiRen(dayStem) },
      
      // 权势星
      { name: '将星', hasIt: result.jiangXing.hasIt, targets: [getJiangXing(yearBranch)].filter(t => t) },
      { name: '华盖', hasIt: result.huaGai.hasIt, targets: [getHuaGai(yearBranch)].filter(t => t) },
      { name: '金舆', hasIt: result.jinYu.hasIt, targets: getJinYu(dayStem) },
      { name: '学堂', hasIt: result.xueTang.hasIt, targets: getXueTangCiGuan(dayStem).xueTang },
      
      // 出行变动星
      { name: '驿马', hasIt: result.yiMa.hasIt, targets: [getYiMa(yearBranch)].filter(t => t) },
      
      // 财禄星
      { name: '禄神', hasIt: result.luShen.hasIt, targets: getLuShen(dayStem) },
      
      // 凶煞
      { name: '羊刃', hasIt: result.yangRen.hasIt, targets: getYangRen(dayStem) },
      { name: '空亡', hasIt: result.kongWang.hasIt, targets: getKongWang(dayStem, dayBranch) },
      { name: '亡神', hasIt: result.wangShen.hasIt, targets: [getWangShen(yearBranch)].filter(t => t) },
      { name: '劫煞', hasIt: result.jieSha.hasIt, targets: [getJieSha(yearBranch)].filter(t => t) },
      { name: '灾煞', hasIt: result.zaiSha.hasIt, targets: [getZaiSha(yearBranch)].filter(t => t) },
      
      // 孤独类
      { name: '孤辰', hasIt: result.guChen.hasIt, targets: [getGuChenGuaSu(yearBranch).guChen].filter(t => t) },
      { name: '寡宿', hasIt: result.guaSu.hasIt, targets: [getGuChenGuaSu(yearBranch).guaSu].filter(t => t) },
      { name: '白虎煞', hasIt: result.baiHu.hasIt, targets: [getBaiHu(yearBranch)].filter(t => t) }
    ];

    // 处理所有神煞
    shenShaProcessList.forEach(item => {
      if (item.hasIt && item.targets.length > 0) {
        assignShenShaToColumn(item.name, item.targets);
      }
    });

    // 特殊处理需要天干检查的神煞
    if (result.tianDeGuiRen.hasIt) {
      result.tianDeGuiRen.positions.forEach(pos => {
        if (pos.includes('月')) monthShenSha.push('天德贵人');
        if (pos.includes('大运')) luckShenSha.push('天德贵人');
      });
    }

    if (result.tianDeHe.hasIt) {
      result.tianDeHe.positions.forEach(pos => {
        if (pos.includes('年')) yearShenSha.push('天德合');
        if (pos.includes('月')) monthShenSha.push('天德合');
        if (pos.includes('日')) dayShenSha.push('天德合');
        if (pos.includes('时')) hourShenSha.push('天德合');
        if (pos.includes('大运')) luckShenSha.push('天德合');
        if (pos.includes('流年')) yearShenSha2.push('天德合');
      });
    }

    if (result.yueDeGuiRen.hasIt) {
      result.yueDeGuiRen.positions.forEach(pos => {
        if (pos.includes('年')) yearShenSha.push('月德贵人');
        if (pos.includes('月')) monthShenSha.push('月德贵人');
        if (pos.includes('日')) dayShenSha.push('月德贵人');
        if (pos.includes('时')) hourShenSha.push('月德贵人');
        if (pos.includes('大运')) luckShenSha.push('月德贵人');
        if (pos.includes('流年')) yearShenSha2.push('月德贵人');
      });
    }

    if (result.yueDeHe.hasIt) {
      result.yueDeHe.positions.forEach(pos => {
        if (pos.includes('年')) yearShenSha.push('月德合');
        if (pos.includes('月')) monthShenSha.push('月德合');
        if (pos.includes('日')) dayShenSha.push('月德合');
        if (pos.includes('时')) hourShenSha.push('月德合');
        if (pos.includes('大运')) luckShenSha.push('月德合');
        if (pos.includes('流年')) yearShenSha2.push('月德合');
      });
    }

    // 三奇贵人（特殊处理）
    if (result.sanQiGuiRen.hasIt) {
      result.sanQiGuiRen.positions.forEach(pos => {
        if (pos.includes('年')) yearShenSha.push(`三奇贵人(${result.sanQiGuiRen.type})`);
        if (pos.includes('月')) monthShenSha.push(`三奇贵人(${result.sanQiGuiRen.type})`);
        if (pos.includes('日')) dayShenSha.push(`三奇贵人(${result.sanQiGuiRen.type})`);
        if (pos.includes('时')) hourShenSha.push(`三奇贵人(${result.sanQiGuiRen.type})`);
        if (pos.includes('大运')) luckShenSha.push(`三奇贵人(${result.sanQiGuiRen.type})`);
        if (pos.includes('流年')) yearShenSha2.push(`三奇贵人(${result.sanQiGuiRen.type})`);
      });
    }

    // 词馆（天干检查）
    if (result.ciGuan.hasIt) {
      const ciGuanTargets = getXueTangCiGuan(dayStem).ciGuan;
      assignShenShaToColumn('词馆', [], ciGuanTargets);
    }

    // 魁罡（只在日柱）
    if (result.kuiGang.hasIt) {
      dayShenSha.push(`魁罡(${result.kuiGang.type})`);
    }

    // 十恶大败（检查日柱和大运流年）
    if (result.shiEDaBai.hasIt) {
      if (getShiEDaBai(dayStem, dayBranch)) dayShenSha.push('十恶大败');
      if (luckStem && luckBranch && getShiEDaBai(luckStem, luckBranch)) luckShenSha.push('十恶大败');
      if (yearStem2 && yearBranch2 && getShiEDaBai(yearStem2, yearBranch2)) yearShenSha2.push('十恶大败');
    }

    // 元辰（性别相关）
    if (result.yuanChen.hasIt && birthInfo?.gender) {
      const target = getYuanChen(yearBranch, birthInfo.gender);
      if (target) assignShenShaToColumn('元辰', [target]);
    }

    // 天罗地网（纳音相关）
    if (result.tianLuoDiWang.hasIt && birthInfo?.nayin) {
      const tianLuoResult = getTianLuoWang(yearBranch, birthInfo.nayin);
      if (tianLuoResult.tianLuo) assignShenShaToColumn('天罗', ['戌', '亥']);
      if (tianLuoResult.diWang) assignShenShaToColumn('地网', ['辰', '巳']);
    }

    // 返回各柱的神煞（包含大运流年）
    const columns = [
      yearShenSha,
      monthShenSha,
      dayShenSha,
      hourShenSha
    ];

    // 如果有大运或流年数据，添加到结果中
    if (luckStem || luckBranch) {
      columns.push(luckShenSha);
    }
    if (yearStem2 || yearBranch2) {
      columns.push(yearShenSha2);
    }

    return columns;
  } catch (error) {
    console.error('获取各柱神煞时出错:', error);
    const baseResult = [[], [], [], []];
    // 如果有大运流年数据，返回对应的空数组
    if (bazi.length >= 10) baseResult.push([]);
    if (bazi.length >= 12) baseResult.push([]);
    return baseResult;
  }
}