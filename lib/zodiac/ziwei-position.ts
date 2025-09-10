import { EarthlyBranch, EARTHLY_BRANCHES } from './branches';
import { FiveElementsBureau, BUREAU_TO_NUMBER } from './five-elements-bureau';

// Mapping from bureau number to its column index in the table
const bureauToColumnIndex: Record<number, number> = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4 };

// The table data from the image
const ZIWEI_TABLE: EarthlyBranch[][] = [
  // 水二局   木三局   金四局   土五局   火六局 (生  日)
  [ '丑', '辰', '亥', '午', '酉' ], // 1
  [ '寅', '丑', '辰', '亥', '午' ], // 2
  [ '寅', '寅', '丑', '辰', '亥' ], // 3
  [ '卯', '巳', '寅', '丑', '辰' ], // 4
  [ '卯', '寅', '子', '寅', '丑' ], // 5
  [ '辰', '卯', '巳', '未', '寅' ], // 6
  [ '辰', '午', '寅', '子', '戌' ], // 7
  [ '巳', '卯', '卯', '巳', '未' ], // 8
  [ '巳', '辰', '丑', '寅', '子' ], // 9
  [ '午', '未', '午', '卯', '巳' ], // 10
  [ '午', '辰', '卯', '申', '寅' ], // 11
  [ '未', '巳', '辰', '丑', '卯' ], // 12
  [ '未', '申', '寅', '午', '亥' ], // 13
  [ '申', '巳', '未', '卯', '申' ], // 14
  [ '申', '午', '辰', '辰', '丑' ], // 15
  [ '酉', '酉', '巳', '酉', '午' ], // 16
  [ '酉', '午', '卯', '寅', '寅' ], // 17
  [ '戌', '未', '申', '未', '辰' ], // 18
  [ '戌', '戌', '巳', '辰', '子' ], // 19
  [ '亥', '未', '午', '巳', '酉' ], // 20
  [ '亥', '申', '辰', '戌', '寅' ], // 21
  [ '子', '亥', '酉', '卯', '未' ], // 22
  [ '子', '申', '午', '申', '辰' ], // 23
  [ '丑', '酉', '未', '巳', '巳' ], // 24
  [ '丑', '子', '巳', '午', '丑' ], // 25
  [ '寅', '酉', '戌', '亥', '戌' ], // 26
  [ '寅', '戌', '未', '辰', '卯' ], // 27
  [ '卯', '丑', '申', '酉', '申' ], // 28
  [ '卯', '戌', '午', '午', '巳' ], // 29
  [ '辰', '亥', '亥', '未', '午' ], // 30
];

export function getZiweiPosition(bureau: FiveElementsBureau, day: number): EarthlyBranch | undefined {
  const bureauNumber = BUREAU_TO_NUMBER[bureau];
  const columnIndex = bureauToColumnIndex[bureauNumber];
  
  // Day is 1-indexed, so subtract 1 for array access
  const rowIndex = day - 1;

  if (columnIndex !== undefined && ZIWEI_TABLE[rowIndex]) {
    return ZIWEI_TABLE[rowIndex][columnIndex];
  }
  return undefined;
} 