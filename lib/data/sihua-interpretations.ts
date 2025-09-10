// 生年四化解释数据
// 数据格式：宫位编号=星名+化忌符号 (例如：1=廉贞A)
// 宫位编号：1=命宫，2=兄弟宫，3=夫妻宫...12=父母宫
// 化忌符号：A=化禄，B=化权，C=化科，D=化忌

export interface SihuaInterpretation {
  key: string; // 例如：'1=廉贞A'
  palace: string; // 宫位名称
  star: string; // 星曜名称
  hua: string; // 化星类型：A(化禄)、B(化权)、C(化科)、D(化忌)
  interpretation: string; // 解释内容
}

// 🔥 导入完整的460条四化数据
import { SIHUA_INTERPRETATIONS_COMPLETE } from './sihua-interpretations-complete';

export const SIHUA_INTERPRETATIONS: SihuaInterpretation[] = [
  // 命宫生年四化解释
  {
    key: '1=廉贞A',
    palace: '命宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '命宫廉贞化禄 主权威，具备领导能力，能够赢得他人的服从与支持，工作顺利。同时也主桃花，若廉贞不化禄，桃花不明显，但一旦化禄，桃花便随之而来。在行限中遇到各类疑难问题，能够顺利解决，并有喜庆之事，遇到煞则可能有情感上的纠缠。'
  },
  {
    key: '1=天机A',
    palace: '命宫',
    star: '天机',
    hua: 'A',
    interpretation: '命宫天机化禄 具备智慧和丰富的想象力，擅长谋划和参谋工作。生活富足，能够享受生活，但常因追求财富而忙碌。热爱宗教、阴阳学和哲学。'
  },
  {
    key: '1=天同A',
    palace: '命宫',
    star: '天同',
    hua: 'A',
    interpretation: '命宫天同化禄 主解厄、福气，运气良好。口福和人缘佳，常有不劳而获的机会，喜欢享受生活，但可能缺乏行动力。'
  },
  {
    key: '1=太阴A',
    palace: '命宫',
    star: '太阴',
    hua: 'A',
    interpretation: '命宫太阴化禄 主财库和安逸，但缺乏解厄的能力。女性命主有机会成为老板，聪明且能力出众，喜爱干净和享受生活。'
  },
  {
    key: '1=贪狼A',
    palace: '命宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '命宫贪狼化禄 主桃花、享受美酒，长寿且聪明。偏财运较好，具有投机性质。'
  },
  {
    key: '1=武曲A',
    palace: '命宫',
    star: '武曲',
    hua: 'A',
    interpretation: '命宫武曲化禄 正财星，主财运。化禄入命，个性刚强，善于赚钱，选择善良的事物并坚守信念。'
  },
  {
    key: '1=太阳A',
    palace: '命宫',
    star: '太阳',
    hua: 'A',
    interpretation: '命宫太阳化禄 具备领导者特质，掌握实权。若受雇于人，也能担任实权的主管。名声威严且具魄力，热情博爱。'
  },
  {
    key: '1=巨门A',
    palace: '命宫',
    star: '巨门',
    hua: 'A',
    interpretation: '命宫巨门化禄 口才出众，口福良好，以言语为业，能通过说话赚钱。巨门化禄与文昌或文曲同宫，女性命主需谨慎，可能面临情感上的困扰。'
  },
  {
    key: '1=天梁A',
    palace: '命宫',
    star: '天梁',
    hua: 'A',
    interpretation: '命宫天梁化禄 有祖荫庇护，长寿且能解厄。善于沟通，知识渊博，喜爱古典事物和五术。'
  },
  {
    key: '1=破军A',
    palace: '命宫',
    star: '破军',
    hua: 'A',
    interpretation: '命宫破军化禄 主变迁机会多，能够开创新局面并获得收益。敢于冒险，适合经商，能解厄。此外，夫妻、子女和交友方面也会有所收获。'
  },
  {
    key: '1=破军B',
    palace: '命宫',
    star: '破军',
    hua: 'B',
    interpretation: '命宫破军化权 主驿马，入寅、申、巳、亥四马地主变动，主本人喜欢变动。'
  },
  {
    key: '1=天梁B',
    palace: '命宫',
    star: '天梁',
    hua: 'B',
    interpretation: '命宫天梁化权 主独树一帜，展现出比他人更强的能力，言辞犀利，能折服不少人。喜欢参与他人事务，乐于助人。'
  },
  {
    key: '1=天机B',
    palace: '命宫',
    star: '天机',
    hua: 'B',
    interpretation: '命宫天机化权 善于筹划自己的事务，精打细算，能干。在寅、申、巳、亥时更为主动，计划性地向远方发展。'
  },
  {
    key: '1=天同B',
    palace: '命宫',
    star: '天同',
    hua: 'B',
    interpretation: '命宫天同化权 天同化权为吉，福星加权，能激发干劲，主少劳多获，生活快乐安详。'
  },
  {
    key: '1=太阴B',
    palace: '命宫',
    star: '太阴',
    hua: 'B',
    interpretation: '命宫太阴化权 主享受生活，自得其乐。若太阴失辉，则可能无福。男性命主需谨慎，女性命主则在创业上表现活跃，有干劲。'
  },
  {
    key: '1=贪狼B',
    palace: '命宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '命宫贪狼化权 主能干，有所作为，具备辩才，善于交际应酬。风流且与异性缘分深厚，桃花旺盛，同时也主喜掌权、固执。'
  },
  {
    key: '1=武曲B',
    palace: '命宫',
    star: '武曲',
    hua: 'B',
    interpretation: '命宫武曲化权 主创业，但也可能面临挑战。性格刚强，男性命主在创业时需付出努力，但往往能获得成功；女性命主则需谨慎，可能面临孤独，若不晚婚，可能会经历寡居。'
  },
  {
    key: '1=太阳B',
    palace: '命宫',
    star: '太阳',
    hua: 'B',
    interpretation: '命宫太阳化权 主刚强，适合创业，固执且表现欲强烈。女性命主需谨慎。'
  },
  {
    key: '1=紫微B',
    palace: '命宫',
    star: '紫微',
    hua: 'B',
    interpretation: '命宫紫微化权 主能力强，具备领导才能，掌握大权。但需善于左右局面，才能更好地发挥作用。主权力大，但缺乏解厄的能力。'
  },
  {
    key: '1=巨门B',
    palace: '命宫',
    star: '巨门',
    hua: 'B',
    interpretation: '命宫巨门化权 主口才出众，言辞铿锵有力，条理分明。开口即有利，能通过言语获得财富；但若言辞不当，则易遭非议，特别是在煞星冲照时。'
  },
  {
    key: '1=武曲C',
    palace: '命宫',
    star: '武曲',
    hua: 'C',
    interpretation: '命宫武曲化科 武曲为财星，化科主财名光耀，适合服务于财经界，兼得财名。若遇煞忌，则可能华而不实，表面好看而已。'
  },
  {
    key: '1=紫微C',
    palace: '命宫',
    star: '紫微',
    hua: 'C',
    interpretation: '命宫紫微化科 紫微化科入命，主贵人相助，此科有解厄之功，紫微也能发挥解厄的力量。'
  },
  {
    key: '1=文昌C',
    palace: '命宫',
    star: '文昌',
    hua: 'C',
    interpretation: '命宫文昌化科 文昌为文星，化科主文，故主才学优异、智慧高，有才名，多才多艺。同时主贵人相助，具备解厄的能力。'
  },
  {
    key: '1=天机C',
    palace: '命宫',
    star: '天机',
    hua: 'C',
    interpretation: '命宫天机化科 主智慧，聪明且善于动脑筋，为企划高手。外表斯文，但头脑灵活。若遇煞忌，则可能白费心机，波动较大。'
  },
  {
    key: '1=右弼C',
    palace: '命宫',
    star: '右弼',
    hua: 'C',
    interpretation: '命宫右弼化科 主贵人，右弼的贵人通常是暗中协助的，且主机智。右弼属水，水星多聪明，善于思考和筹划，化科亦主解厄。'
  },
  {
    key: '1=天梁C',
    palace: '命宫',
    star: '天梁',
    hua: 'C',
    interpretation: '命宫天梁化科 宜深入研究技术及理论，无论是文、史、哲、医、药皆可，能有突破性见解。若无则可能被视为夸夸其谈，且人缘极佳，受到父母的关爱与长辈的照顾。'
  },
  {
    key: '1=太阴C',
    palace: '命宫',
    star: '太阴',
    hua: 'C',
    interpretation: '命宫太阴化科 可因女性而成名，喜欢打扮得体。男性命主需谨慎，以免过于注重外表。喜在阴暗处做一些小事，如存私房钱或从事中介赚取佣金。'
  },
  {
    key: '1=文曲C',
    palace: '命宫',
    star: '文曲',
    hua: 'C',
    interpretation: '命宫文曲化科 文星，化科主文，故主才学优异、智慧高，有才名，多才多艺。亦主贵人，主解厄。'
  },
  {
    key: '1=左辅C',
    palace: '命宫',
    star: '左辅',
    hua: 'C',
    interpretation: '命宫左辅化科 主贵人，左辅的贵人通常是明贵，直接扶助。主稳重、圆滑、风流且随和，同时也主解厄。'
  },
  {
    key: '1=太阳D',
    palace: '命宫',
    star: '太阳',
    hua: 'D',
    interpretation: '命宫太阳化忌 太阳星属男性，幼年时主父，中年时男性命主自我，女性命主丈夫，老年时主儿子。太阳化忌主凶，可能导致个性较为刚烈，容易发脾气。太阳在失辉宫位，常有烦恼，想要发脾气却难以实现，感到郁闷。太阳主眼睛，化忌则眼睛易感疲劳，若在失辉宫位，眼睛常痛。若太阳在子宫，虽然不化忌，但在某些情况下也可能出现上述问题，影响性情。主劳碌，太阳旺守宫位时，努力方能成就；太阳失辉则可能引发口舌是非。'
  },
  {
    key: '1=太阴D',
    palace: '命宫',
    star: '太阴',
    hua: 'D',
    interpretation: '命宫太阴化忌 太阴主财，化忌则可能导致财务困难。太阴为田宅宫主，化忌则常为住宅烦心。主常有暗亏，以及难以言说的心事。太阴失辉之宫位，情况更为严峻。太阴主女性，幼年时主母亲，中年时男性命主的配偶，女性命主本身，晚年时主女儿。太阴化忌，特别不利女性命主。'
  },
  {
    key: '1=廉贞D',
    palace: '命宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '命宫廉贞化忌 主叛逆性，可能表现出较为自由的个性。廉贞化忌可能导致法律问题，遇到桃花星则可能引发情感上的纠纷。需谨慎处理感情与法律事务，避免不必要的麻烦。'
  },
  {
    key: '1=巨门D',
    palace: '命宫',
    star: '巨门',
    hua: 'D',
    interpretation: '命宫巨门化忌 主要面临口舌是非。巨门化忌时，可能因无心之言而得罪他人。讲话时可能不够考虑用词，容易引发误解和争议。需注意与他人的沟通，避免因言辞不当而引发的麻烦。'
  },
  {
    key: '1=天机D',
    palace: '命宫',
    star: '天机',
    hua: 'D',
    interpretation: '命宫天机化忌 天机主智慧，化忌时可能导致思维僵化，难以变通。可能倾向于钻牛角尖，导致与他人关系紧张。需保持开放的心态，避免过度执着于某些观点。'
  },
  {
    key: '1=文曲D',
    palace: '命宫',
    star: '文曲',
    hua: 'D',
    interpretation: '命宫文曲化忌 文曲主口才，化忌则可能导致表达不畅，容易引发感情困扰。需注意与他人的沟通，保持良好的情感交流。'
  },
  {
    key: '1=天同D',
    palace: '命宫',
    star: '天同',
    hua: 'D',
    interpretation: '命宫天同化忌 天同主福寿，化忌则可能影响福气和健康。可能表现出懒散，不愿意工作，导致机会的流失。需努力克服惰性，保持积极的生活态度。'
  },
  {
    key: '1=文昌D',
    palace: '命宫',
    star: '文昌',
    hua: 'D',
    interpretation: '命宫文昌化忌 文昌主典章制度，化忌则可能导致过于拘泥于规矩，反而影响正常生活。需保持灵活性，避免因过于严格的自我要求而感到困扰。'
  },
  {
    key: '1=武曲D',
    palace: '命宫',
    star: '武曲',
    hua: 'D',
    interpretation: '命宫武曲化忌 武曲化忌可能导致孤独感。个性执着，可能会对生活感到压抑。需学会放松心态，寻找内心的平衡。武曲主财，化忌则可能面临财务问题。'
  },
  {
    key: '1=贪狼D',
    palace: '命宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '命宫贪狼化忌 贪狼主欲望，化忌时可能导致空想和不切实际的目标。需关注现实，避免因追求虚幻的理想而失去方向。感情方面可能面临挑战，需谨慎处理人际关系。'
  },

  // 兄弟宫生年四化解释
  {
    key: '2=廉贞A',
    palace: '兄弟宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '兄弟宫廉贞化禄 主兄弟有异性缘，且本人可能有暗桃花，因兄弟宫在奴仆宫的对宫之故。兄弟之间感情融洽。'
  },
  {
    key: '2=天机A',
    palace: '兄弟宫',
    star: '天机',
    hua: 'A',
    interpretation: '兄弟宫天机化禄 主兄弟聪明且富有智慧，热心于宗教、哲学和阴阳学。仅指兄弟，不包括姐妹。家庭财务状况良好，银行存有现金。'
  },
  {
    key: '2=天同A',
    palace: '兄弟宫',
    star: '天同',
    hua: 'A',
    interpretation: '兄弟宫天同化禄 主兄弟和谐，相互帮助，兄弟有福气但可能缺乏作为。'
  },
  {
    key: '2=太阴A',
    palace: '兄弟宫',
    star: '太阴',
    hua: 'A',
    interpretation: '兄弟宫太阴化禄 主与姐妹缘分深厚，联系紧密，能够相互帮助，适合合伙做生意。'
  },
  {
    key: '2=贪狼A',
    palace: '兄弟宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '兄弟宫贪狼化禄 主偏财，建议与兄弟朋友多交际应酬，享受饮酒作乐的时光。'
  },
  {
    key: '2=武曲A',
    palace: '兄弟宫',
    star: '武曲',
    hua: 'A',
    interpretation: '兄弟宫武曲化禄 主兄弟个性强，能力出众。'
  },
  {
    key: '2=太阳A',
    palace: '兄弟宫',
    star: '太阳',
    hua: 'A',
    interpretation: '兄弟宫太阳化禄 主本人虽有领导者的命格，但可能没有实权，若非挂名者，则为合伙股东，热情且有桃花运。'
  },
  {
    key: '2=巨门A',
    palace: '兄弟宫',
    star: '巨门',
    hua: 'A',
    interpretation: '兄弟宫巨门化禄 兄弟的情况可以套用命宫的解释，兄弟能独立创业。本人交际应酬较多，与兄弟朋友一起聚会、聊天。'
  },
  {
    key: '2=天梁A',
    palace: '兄弟宫',
    star: '天梁',
    hua: 'A',
    interpretation: '兄弟宫天梁化禄 兄弟的情况也可以套用命宫的解释，兄弟独立创业。本人受兄姐的关爱。'
  },
  {
    key: '2=破军A',
    palace: '兄弟宫',
    star: '破军',
    hua: 'A',
    interpretation: '兄弟宫破军化禄 与朋友相处和谐，能够相互帮助，因为破军化禄在兄弟宫照应奴仆。大姐与长兄可能会有意外的收获。'
  },
  {
    key: '2=破军B',
    palace: '兄弟宫',
    star: '破军',
    hua: 'B',
    interpretation: '兄弟宫破军化权 由于交友关系，破军主奴仆，因此能在朋友和部属之间施权、号令。'
  },
  {
    key: '2=天梁B',
    palace: '兄弟宫',
    star: '天梁',
    hua: 'B',
    interpretation: '兄弟宫天梁化权 较听从哥哥的话，但有时也会顶撞他，主哥哥较有能力。'
  },
  {
    key: '2=天机B',
    palace: '兄弟宫',
    star: '天机',
    hua: 'B',
    interpretation: '兄弟宫天机化权 主兄弟易有变迁和变故，主要指兄弟，不太涉及姐妹。'
  },
  {
    key: '2=天同B',
    palace: '兄弟宫',
    star: '天同',
    hua: 'B',
    interpretation: '兄弟宫天同化权 主兄弟姐妹较为懒散，常常推诿工作，争相享受清闲生活。'
  },
  {
    key: '2=太阴B',
    palace: '兄弟宫',
    star: '太阴',
    hua: 'B',
    interpretation: '兄弟宫太阴化权 主姐妹勤劳奔波，积极创业。'
  },
  {
    key: '2=贪狼B',
    palace: '兄弟宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '兄弟宫贪狼化权 主兄弟姐妹可能表现出固执和霸道。'
  },
  {
    key: '2=武曲B',
    palace: '兄弟宫',
    star: '武曲',
    hua: 'B',
    interpretation: '兄弟宫武曲化权 主兄弟姐妹喜欢掌握权力。'
  },
  {
    key: '2=太阳B',
    palace: '兄弟宫',
    star: '太阳',
    hua: 'B',
    interpretation: '兄弟宫太阳化权 主兄弟喜爱表现自己，竞争心强，倾向于自行创业。'
  },
  {
    key: '2=紫微B',
    palace: '兄弟宫',
    star: '紫微',
    hua: 'B',
    interpretation: '兄弟宫紫微化权 主兄弟拥有威权。'
  },
  {
    key: '2=巨门B',
    palace: '兄弟宫',
    star: '巨门',
    hua: 'B',
    interpretation: '兄弟宫巨门化权 主兄弟口才不错，但可能会发生兄弟间的争吵，言辞激烈。'
  },
  {
    key: '2=武曲C',
    palace: '兄弟宫',
    star: '武曲',
    hua: 'C',
    interpretation: '兄弟宫武曲化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=紫微C',
    palace: '兄弟宫',
    star: '紫微',
    hua: 'C',
    interpretation: '兄弟宫紫微化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=文昌C',
    palace: '兄弟宫',
    star: '文昌',
    hua: 'C',
    interpretation: '兄弟宫文昌化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=天机C',
    palace: '兄弟宫',
    star: '天机',
    hua: 'C',
    interpretation: '兄弟宫天机化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=右弼C',
    palace: '兄弟宫',
    star: '右弼',
    hua: 'C',
    interpretation: '兄弟宫右弼化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=天梁C',
    palace: '兄弟宫',
    star: '天梁',
    hua: 'C',
    interpretation: '兄弟宫天梁化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=文曲C',
    palace: '兄弟宫',
    star: '文曲',
    hua: 'C',
    interpretation: '兄弟宫文曲化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=左辅C',
    palace: '兄弟宫',
    star: '左辅',
    hua: 'C',
    interpretation: '兄弟宫左辅化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=太阴C',
    palace: '兄弟宫',
    star: '太阴',
    hua: 'C',
    interpretation: '兄弟宫太阴化科 兄弟才学出众，是我的贵人。'
  },
  {
    key: '2=太阳D',
    palace: '兄弟宫',
    star: '太阳',
    hua: 'D',
    interpretation: '兄弟宫太阳化忌 主兄弟可能面临损失，不涉及姐妹。与男性朋友之间可能存在债务关系。'
  },
  {
    key: '2=太阴D',
    palace: '兄弟宫',
    star: '太阴',
    hua: 'D',
    interpretation: '兄弟宫太阴化忌 主姐妹可能面临损失，不涉及兄弟。与女性朋友之间可能存在债务关系。'
  },
  {
    key: '2=廉贞D',
    palace: '兄弟宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '兄弟宫廉贞化忌 主交往的朋友可能是浪荡之人或赌徒，这些人可能让你感到困扰。兄弟中可能有人爱好赌博，或与不良团体有联系，桃花星也可能在友人中出现，带来一些复杂的情感问题。'
  },
  {
    key: '2=巨门D',
    palace: '兄弟宫',
    star: '巨门',
    hua: 'D',
    interpretation: '兄弟宫巨门化忌 主兄弟姐妹中可能有长舌之人，可能与广播电台有关。兄弟姐妹之间在思想和言语上可能存在沟通障碍，常常有口舌是非。'
  },
  {
    key: '2=天机D',
    palace: '兄弟宫',
    star: '天机',
    hua: 'D',
    interpretation: '兄弟宫天机化忌 天机主兄弟，化忌入兄弟宫可能导致关系疏远，彼此间存在冲突。主兄弟可能面临损失，不涉及姐妹。'
  },
  {
    key: '2=文曲D',
    palace: '兄弟宫',
    star: '文曲',
    hua: 'D',
    interpretation: '兄弟宫文曲化忌 主兄弟之间的感情多变，可能出现金钱方面的问题，兄弟间的借贷关系可能引发争议。'
  },
  {
    key: '2=天同D',
    palace: '兄弟宫',
    star: '天同',
    hua: 'D',
    interpretation: '兄弟宫天同化忌 与兄弟姐妹之间常有协调不良的情况，主兄弟姐妹可能有福却无法享受，或者身体健康状况不佳。'
  },
  {
    key: '2=文昌D',
    palace: '兄弟宫',
    star: '文昌',
    hua: 'D',
    interpretation: '兄弟宫文昌化忌 主兄弟之间可能面临文书方面的麻烦，主兄弟对事理和礼乐的理解可能存在过犹不及的现象。'
  },
  {
    key: '2=武曲D',
    palace: '兄弟宫',
    star: '武曲',
    hua: 'D',
    interpretation: '兄弟宫武曲化忌 主兄弟姐妹可能面临孤独感，可能有兄弟姐妹选择修行或出家。'
  },
  {
    key: '2=贪狼D',
    palace: '兄弟宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '兄弟宫贪狼化忌 主兄弟姐妹可能经历情感上的波折，甚至离婚。兄弟姐妹中可能有人对五术等冷门学问有深入研究。'
  }
];

// 根据宫位编号和星曜名称获取四化解释 - 🔥 使用完整数据
export function getSihuaInterpretation(palaceNumber: number, starName: string, hua: string): string | null {
  const key = `${palaceNumber}=${starName}${hua}`;
  const interpretation = SIHUA_INTERPRETATIONS_COMPLETE.find(item => item.key === key);
  return interpretation ? interpretation.interpretation : null;
}

// 根据宫位名称获取该宫位的所有四化解释 - 🔥 使用完整数据
export function getSihuaInterpretationsByPalace(palaceName: string): SihuaInterpretation[] {
  return SIHUA_INTERPRETATIONS_COMPLETE.filter(item => item.palace === palaceName);
} 