/**
 * 紫微斗数宫位关系查询功能
 * Palace Relationship Queries for ZiWei DouShu
 */
/**
 * 获取对宫位置 (Get Opposite Palace)
 * 对宫是相对180度的位置关系
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 对宫索引
 */
export declare function getOppositePalace(palaceIndex: number): number;
/**
 * 获取三合宫位置 (Get Trinity Palaces)
 * 修正版：159关系 - 以输入宫位为基准，第1、5、9个位置形成三合
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 三合宫索引数组 [本宫, 第5宫, 第9宫]
 */
export declare function getTrinityPalaces(palaceIndex: number): number[];
/**
 * 获取四正宫位置 (Get Square Palaces)
 * 修正版：1 4 7 10关系 - 以输入宫位为基准，第1、4、7、10个位置形成四正
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 四正宫索引数组 [本宫, 第4宫, 第7宫, 第10宫]
 */
export declare function getSquarePalaces(palaceIndex: number): number[];
/**
 * 获取本体宫位置 (Get Essence Palace)
 * 修正版：16关系 - 以输入宫位为基准，第1宫和第6宫形成本体关系
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 本体宫索引数组 [本宫, 第6宫]
 */
export declare function getEssencePalace(palaceIndex: number): number[];
/**
 * 获取宫位关系的详细信息 (Get Palace Relationship Details)
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 完整的宫位关系信息
 */
export interface PalaceRelationships {
    basePalace: {
        index: number;
        name: string;
    };
    opposite: {
        index: number;
        name: string;
    };
    trinity: Array<{
        index: number;
        name: string;
        position: '本宫' | '第5宫' | '第9宫';
    }>;
    square: Array<{
        index: number;
        name: string;
        position: '本宫' | '第4宫' | '第7宫' | '第10宫';
    }>;
    essence: Array<{
        index: number;
        name: string;
        position: '本宫' | '第6宫';
    }>;
}
export declare function getPalaceRelationships(palaceIndex: number): PalaceRelationships;
/**
 * 工具函数：验证宫位索引
 * @param palaceIndex 宫位索引
 * @returns 是否有效
 */
export declare function isValidPalaceIndex(palaceIndex: number): boolean;
/**
 * 工具函数：通过宫位名称获取索引
 * @param palaceName 宫位名称
 * @returns 宫位索引，未找到时返回-1
 */
export declare function getPalaceIndexByName(palaceName: string): number;
