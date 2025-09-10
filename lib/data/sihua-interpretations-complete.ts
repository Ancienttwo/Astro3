// 生年四化解释数据 - 完整版（468条）
// 数据格式：宫位编号=星名+化星符号 (例如：1=廉贞A)
// 宫位编号：1=命宫，2=兄弟宫，3=夫妻宫...12=父母宫
// 化星符号：A=化禄，B=化权，C=化科，D=化忌

export interface SihuaInterpretation {
  key: string; // 例如：'1=廉贞A'
  palace: string; // 宫位名称
  star: string; // 星曜名称
  hua: string; // 化星类型：A(化禄)、B(化权)、C(化科)、D(化忌)
  interpretation: string; // 解释内容
}

export const SIHUA_INTERPRETATIONS_COMPLETE: SihuaInterpretation[] = [
  // 命宫生年四化解释（36条）
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

  // 兄弟宫生年四化解释（36条）
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
  },

  // 夫妻宫生年四化解释（39条）
  {
    key: '3=廉贞A',
    palace: '夫妻宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '夫妻宫廉贞化禄 主配偶具有良好的异性缘分。男性命主可能会结识到风情万种的女性。'
  },
  {
    key: '3=天机A',
    palace: '夫妻宫',
    star: '天机',
    hua: 'A',
    interpretation: '夫妻宫天机化禄 主异性缘良好，因工作关系常结识异性，且能够给予彼此帮助，关系融洽。配偶聪明、具备智慧和能力，且可能有宗教信仰。'
  },
  {
    key: '3=天同A',
    palace: '夫妻宫',
    star: '天同',
    hua: 'A',
    interpretation: '夫妻宫天同化禄 配偶对事业有很大帮助，能够化解危机。异性缘较为复杂，可能引发一些纠纷。'
  },
  {
    key: '3=太阴A',
    palace: '夫妻宫',
    star: '太阴',
    hua: 'A',
    interpretation: '夫妻宫太阴化禄 男性主人的配偶贤惠能干，能够主持事业。女性主人的丈夫能给予支持，结婚后能够独当一面。'
  },
  {
    key: '3=贪狼A',
    palace: '夫妻宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '夫妻宫贪狼化禄 配偶与本人都有良好的异性缘，可能会出现外遇，婚前经历波折，越波折越好，适合晚婚。'
  },
  {
    key: '3=武曲A',
    palace: '夫妻宫',
    star: '武曲',
    hua: 'A',
    interpretation: '夫妻宫武曲化禄 配偶个性强，善于赚钱。女性适合晚婚，男性可得妻财，配偶可能会主导家庭事务。'
  },
  {
    key: '3=太阳A',
    palace: '夫妻宫',
    star: '太阳',
    hua: 'A',
    interpretation: '夫妻宫太阳化禄 男性在婚后能够发展自己的事业，且配偶非常能干，通常比男性更勤劳。女性有当老板的潜力，但在家庭中可能只是名义上的角色。'
  },
  {
    key: '3=巨门A',
    palace: '夫妻宫',
    star: '巨门',
    hua: 'A',
    interpretation: '夫妻宫巨门化禄 异性缘良好，但夫妻关系较为薄弱，感情可能经历波折，初恋的结果不理想。配偶口才出众。'
  },
  {
    key: '3=天梁A',
    palace: '夫妻宫',
    star: '天梁',
    hua: 'A',
    interpretation: '夫妻宫天梁化禄 配偶多有贵人相助，事业上常得长辈的支持。适合选择年长的配偶，经历波折越多，越能迎来好运。'
  },
  {
    key: '3=破军A',
    palace: '夫妻宫',
    star: '破军',
    hua: 'A',
    interpretation: '夫妻宫破军化禄 异性缘较好，但夫妻缘较弱。配偶能力强，有所作为，可能会主导家庭事务。'
  },
  {
    key: '3=破军B',
    palace: '夫妻宫',
    star: '破军',
    hua: 'B',
    interpretation: '夫妻宫破军化权 主人需为事业奔波，配偶可能会花费较多。'
  },
  {
    key: '3=天梁B',
    palace: '夫妻宫',
    star: '天梁',
    hua: 'B',
    interpretation: '夫妻宫天梁化权 配偶喜欢掌权，善于表达，能够给予指导。'
  },
  {
    key: '3=天机B',
    palace: '夫妻宫',
    star: '天机',
    hua: 'B',
    interpretation: '夫妻宫天机化权 夫妻之间可能会产生争执。'
  },
  {
    key: '3=天同B',
    palace: '夫妻宫',
    star: '天同',
    hua: 'B',
    interpretation: '夫妻宫天同化权 配偶懂得享受生活。'
  },
  {
    key: '3=太阴B',
    palace: '夫妻宫',
    star: '太阴',
    hua: 'B',
    interpretation: '夫妻宫太阴化权 如果太阴失去光辉，感情可能会出现问题。男性主人的配偶能干，积极创业。'
  },
  {
    key: '3=贪狼B',
    palace: '夫妻宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '夫妻宫贪狼化权 配偶在各方面都采取主动，包括爱情。如果贪狼化权坐在官禄宫，则主本人也能有所作为。'
  },
  {
    key: '3=武曲B',
    palace: '夫妻宫',
    star: '武曲',
    hua: 'B',
    interpretation: '夫妻宫武曲化权 男性应谨慎，可能会遇到强势的配偶。有时在家中怕老婆，但在外可能会有其他情感。'
  },
  {
    key: '3=太阳B',
    palace: '夫妻宫',
    star: '太阳',
    hua: 'B',
    interpretation: '夫妻宫太阳化权 如果太阳失去光辉，女性可能会面临婚姻问题。男性的事业也会受到影响，因太阳主官禄，化忌在夫妻宫可能冲击事业。也可能影响妻子与男性亲属的关系。'
  },
  {
    key: '3=紫微B',
    palace: '夫妻宫',
    star: '紫微',
    hua: 'B',
    interpretation: '夫妻宫紫微化权 如果左、右同宫与夫妻同坐官禄，事业环境良好，配偶有一定的权势。'
  },
  {
    key: '3=巨门B',
    palace: '夫妻宫',
    star: '巨门',
    hua: 'B',
    interpretation: '夫妻宫巨门化权 夫妻之间意见不合，争吵不断，各自坚持自己的观点。'
  },
  {
    key: '3=武曲C',
    palace: '夫妻宫',
    star: '武曲',
    hua: 'C',
    interpretation: '夫妻宫武曲化科 主人身家清白，配偶是我的贵人，且配偶在社交中重视面子。'
  },
  {
    key: '3=紫微C',
    palace: '夫妻宫',
    star: '紫微',
    hua: 'C',
    interpretation: '夫妻宫紫微化科 主人身家清白，配偶是我的贵人，且配偶在社交中重视面子。'
  },
  {
    key: '3=文昌C',
    palace: '夫妻宫',
    star: '文昌',
    hua: 'C',
    interpretation: '夫妻宫文昌化科 主人身家清白，配偶是我的贵人，且配偶在社交中重视面子，带有桃花运。'
  },
  {
    key: '3=天机C',
    palace: '夫妻宫',
    star: '天机',
    hua: 'C',
    interpretation: '夫妻宫天机化科 主人身家清白，配偶是我的贵人，且配偶在社交中重视面子。'
  },
  {
    key: '3=右弼C',
    palace: '夫妻宫',
    star: '右弼',
    hua: 'C',
    interpretation: '夫妻宫右弼化科 主人身家清白，配偶是我的贵人，且配偶在社交中重视面子，带有桃花运。'
  },
  {
    key: '3=天梁C',
    palace: '夫妻宫',
    star: '天梁',
    hua: 'C',
    interpretation: '夫妻宫天梁化科 主人身家清白，配偶是我的贵人，配偶在社交中重视面子。'
  },
  {
    key: '3=文曲C',
    palace: '夫妻宫',
    star: '文曲',
    hua: 'C',
    interpretation: '夫妻宫文曲化科 主人身家清白，配偶是我的贵人，且配偶在社交中重视面子，带有桃花运。'
  },
  {
    key: '3=左辅C',
    palace: '夫妻宫',
    star: '左辅',
    hua: 'C',
    interpretation: '夫妻宫左辅化科 主人身家清白，配偶是我的贵人，且配偶在社交中重视面子，带有桃花运。'
  },
  {
    key: '3=太阴C',
    palace: '夫妻宫',
    star: '太阴',
    hua: 'C',
    interpretation: '夫妻宫太阴化科 主人身家清白，配偶是我的贵人，且配偶在社交中重视面子。'
  },
  {
    key: '3=太阳D',
    palace: '夫妻宫',
    star: '太阳',
    hua: 'D',
    interpretation: '夫妻宫太阳化忌 女性的婚姻运势较差，太阳主男性，化忌意味着损失和缺乏缘分。男性的事业也会受到影响，因为太阳是官禄主，化忌在夫妻宫可能冲击事业，同时也可能影响妻子与男性亲属的关系。'
  },
  {
    key: '3=太阴D',
    palace: '夫妻宫',
    star: '太阴',
    hua: 'D',
    interpretation: '夫妻宫太阴化忌 与太阳相反，男性的婚姻运势较差，事业环境也不佳。太阴主财，化忌可能导致破财，且与女性有关。女性可能缺乏创业能力，且可能与离婚男性结婚。'
  },
  {
    key: '3=廉贞D',
    palace: '夫妻宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '夫妻宫廉贞化忌 主感情波动不断，经历和好的过程，情感纠葛难以摆脱。也可能在事业上面临行政或法律上的问题。'
  },
  {
    key: '3=巨门D',
    palace: '夫妻宫',
    star: '巨门',
    hua: 'D',
    interpretation: '夫妻宫巨门化忌 夫妻之间意见不合，争吵频繁，思想差异较大。夫妻年龄差距较大，至少十岁，最好二十岁，才能减少摩擦。女性可能多为偏房，事业上可能会遇到人事上的麻烦。'
  },
  {
    key: '3=天机D',
    palace: '夫妻宫',
    star: '天机',
    hua: 'D',
    interpretation: '夫妻宫天机化忌 夫妻之间多有心病，女性不宜，尤其是男性容易钻牛角尖，缺乏缘分，可能会有情感变动。女性常常面临成为偏妾的风险。男性的配偶可能在家庭中缺乏支持。'
  },
  {
    key: '3=文曲D',
    palace: '夫妻宫',
    star: '文曲',
    hua: 'D',
    interpretation: '夫妻宫文曲化忌 主夫妻感情不和谐，困扰多，桃花运较多。注意事业上的金钱收支问题。'
  },
  {
    key: '3=天同D',
    palace: '夫妻宫',
    star: '天同',
    hua: 'D',
    interpretation: '夫妻宫天同化忌 主夫妻感情不和谐，难以协调，配偶可能有福却无法享受。'
  },
  {
    key: '3=文昌D',
    palace: '夫妻宫',
    star: '文昌',
    hua: 'D',
    interpretation: '夫妻宫文昌化忌 主配偶对事理的追究过于严格，可能导致夫妻关系紧张。文昌主文书，化忌可能引发文书上的麻烦，甚至有离婚的可能。'
  },
  {
    key: '3=武曲D',
    palace: '夫妻宫',
    star: '武曲',
    hua: 'D',
    interpretation: '夫妻宫武曲化忌 武曲化忌主孤寡，无论男女皆不宜进入夫妻宫，可能导致婚姻缘分薄弱，结不了婚，即使有婚姻吉运，也可能面临离婚。'
  },
  {
    key: '3=贪狼D',
    palace: '夫妻宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '夫妻宫贪狼化忌 主桃花是非较多，极不利于婚姻，可能面临离异的风险。性生活较为频繁，身体可能受到影响。配偶宜学习命理等知识，可能想要更换职业。'
  },

  // 子女宫生年四化解释（36条）
  {
    key: '4=廉贞A',
    palace: '子女宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '子女宫廉贞化禄 主子女活泼，有良好的异性缘。本人可能会有暗桃花，伴侣较年轻。'
  },
  {
    key: '4=天机A',
    palace: '子女宫',
    star: '天机',
    hua: 'A',
    interpretation: '子女宫天机化禄 主男孩活泼好动且聪明。子女数量可能较少。'
  },
  {
    key: '4=天同A',
    palace: '子女宫',
    star: '天同',
    hua: 'A',
    interpretation: '子女宫天同化禄 主得贵子，通常是胖娃娃、福星型。儿女可能性格较软弱，怕事且不积极。本人在外多享受福气，但桃花运可能带来纠纷，感情经历波折。'
  },
  {
    key: '4=太阴A',
    palace: '子女宫',
    star: '太阴',
    hua: 'A',
    interpretation: '子女宫太阴化禄 主男孩和女孩较多。子女聪明，男孩日后异性缘佳，儿女会比较富有。太阴旺守，主本人可能拥有不动产，可以与人合伙做生意。'
  },
  {
    key: '4=贪狼A',
    palace: '子女宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '子女宫贪狼化禄 主本人性欲较强，尤其在水宫方面，外面桃花较多。子女聪明，求知欲旺盛。'
  },
  {
    key: '4=武曲A',
    palace: '子女宫',
    star: '武曲',
    hua: 'A',
    interpretation: '子女宫武曲化禄 子女聪明且倔强，将来很会赚钱，具有创业能力。主本人在外金钱调度灵活。'
  },
  {
    key: '4=太阳A',
    palace: '子女宫',
    star: '太阳',
    hua: 'A',
    interpretation: '子女宫太阳化禄 男性在结婚后有子女，方可当老板或与人合伙，但通常没有实权。'
  },
  {
    key: '4=巨门A',
    palace: '子女宫',
    star: '巨门',
    hua: 'A',
    interpretation: '子女宫巨门化禄 晚得子，长子可能难以养活。主子女口才好，喜欢辩论。'
  },
  {
    key: '4=天梁A',
    palace: '子女宫',
    star: '天梁',
    hua: 'A',
    interpretation: '子女宫天梁化禄 主子女受到长辈的疼爱，聪明而富贵，有贵人相助。'
  },
  {
    key: '4=破军A',
    palace: '子女宫',
    star: '破军',
    hua: 'A',
    interpretation: '子女宫破军化禄 对长子不太有利。子女性格倔强，能够创业并取得成功，且孝顺。子女可能生活较为奢侈。本人桃花运较好，伴侣可能偏年轻。'
  },
  {
    key: '4=破军B',
    palace: '子女宫',
    star: '破军',
    hua: 'B',
    interpretation: '子女宫破军化权 破军作为子女主星，入子女宫化权对家庭有助，但需注意可能的灾祸。如果又坐在子、午宫，则子女将来的成就更为非凡。'
  },
  {
    key: '4=天梁B',
    palace: '子女宫',
    star: '天梁',
    hua: 'B',
    interpretation: '子女宫天梁化权 主子女善于争辩，且家庭中可能有大树。'
  },
  {
    key: '4=天机B',
    palace: '子女宫',
    star: '天机',
    hua: 'B',
    interpretation: '子女宫天机化权 主子女善于应变，灵活机智。'
  },
  {
    key: '4=天同B',
    palace: '子女宫',
    star: '天同',
    hua: 'B',
    interpretation: '子女宫天同化权 主子女懂得享受生活。'
  },
  {
    key: '4=太阴B',
    palace: '子女宫',
    star: '太阴',
    hua: 'B',
    interpretation: '子女宫太阴化权 主女儿较为勤劳，喜欢创业。'
  },
  {
    key: '4=贪狼B',
    palace: '子女宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '子女宫贪狼化权 主家庭中可能存在领导地位，与子女关系不太和谐。'
  },
  {
    key: '4=武曲B',
    palace: '子女宫',
    star: '武曲',
    hua: 'B',
    interpretation: '子女宫武曲化权 主子女性格刚强，难以管教。'
  },
  {
    key: '4=太阳B',
    palace: '子女宫',
    star: '太阳',
    hua: 'B',
    interpretation: '子女宫太阳化权 主本人有创业的机会。'
  },
  {
    key: '4=紫微B',
    palace: '子女宫',
    star: '紫微',
    hua: 'B',
    interpretation: '子女宫紫微化权 主子女喜欢担任领导角色。'
  },
  {
    key: '4=巨门B',
    palace: '子女宫',
    star: '巨门',
    hua: 'B',
    interpretation: '子女宫巨门化权 主与子女之间观念差异较大，常有争辩。家庭前可能有大暗沟。'
  },
  {
    key: '4=紫微C',
    palace: '子女宫',
    star: '紫微',
    hua: 'C',
    interpretation: '子女宫紫微化科 主生贵子。'
  },
  {
    key: '4=天机C',
    palace: '子女宫',
    star: '天机',
    hua: 'C',
    interpretation: '子女宫天机化科 除子女聪明外，本人也可以在教育工作上发挥才能，范围广泛，不一定是教师，也可以是教练或命理老师。左右化科：桃花运多样，伴侣可能风雅或打扮漂亮。'
  },
  {
    key: '4=太阴C',
    palace: '子女宫',
    star: '太阴',
    hua: 'C',
    interpretation: '子女宫太阴化科 本人可能喜欢暗藏私房钱，并在暗中给予子女财务支持。其他星座的化科，除前述共通性外，参考各星的性情以论子女财帛宫的情况，表面看似富足，实际上平稳少波动，所需的都有。无其他凶星煞星，化科之财为清白之财。'
  },
  {
    key: '4=武曲C',
    palace: '子女宫',
    star: '武曲',
    hua: 'C',
    interpretation: '子女宫武曲化科 武曲为财星，化科财名二利，安稳能守。适合在壮年后发达，能够持久守住财富。'
  },
  {
    key: '4=右弼C',
    palace: '子女宫',
    star: '右弼',
    hua: 'C',
    interpretation: '子女宫右弼化科 子女聪明，具备文学和艺术才能，爱漂亮，管教容易，性格温文尔雅。'
  },
  {
    key: '4=天梁C',
    palace: '子女宫',
    star: '天梁',
    hua: 'C',
    interpretation: '子女宫天梁化科 子女聪明，具备文学和艺术才能，爱漂亮，管教容易，性格温文尔雅。'
  },
  {
    key: '4=文昌C',
    palace: '子女宫',
    star: '文昌',
    hua: 'C',
    interpretation: '子女宫文昌化科 子女聪明，具备文学和艺术才能，爱漂亮，管教容易，性格温文尔雅。'
  },
  {
    key: '4=文曲C',
    palace: '子女宫',
    star: '文曲',
    hua: 'C',
    interpretation: '子女宫文曲化科 子女聪明，具备文学和艺术才能，爱漂亮，管教容易，性格温文尔雅。'
  },
  {
    key: '4=左辅C',
    palace: '子女宫',
    star: '左辅',
    hua: 'C',
    interpretation: '子女宫左辅化科 子女聪明，具备文学和艺术才能，爱漂亮，管教容易，性格温文尔雅。'
  },
  {
    key: '4=太阳D',
    palace: '子女宫',
    star: '太阳',
    hua: 'D',
    interpretation: '子女宫太阳化忌 主儿子可能面临损失。'
  },
  {
    key: '4=太阴D',
    palace: '子女宫',
    star: '太阴',
    hua: 'D',
    interpretation: '子女宫太阴化忌 主女儿可能面临损失。'
  },
  {
    key: '4=廉贞D',
    palace: '子女宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '子女宫廉贞化忌 主家庭中子女可能多是非，或涉及行政官非。'
  },
  {
    key: '4=巨门D',
    palace: '子女宫',
    star: '巨门',
    hua: 'D',
    interpretation: '子女宫巨门化忌 与子女之间存在代沟，沟通不畅，可能会争吵。子女小时候常常因为言语责骂而烦恼；长大后可能惹麻烦。'
  },
  {
    key: '4=天机D',
    palace: '子女宫',
    star: '天机',
    hua: 'D',
    interpretation: '子女宫天机化忌 主子女可能面临损失，尤其是男孩方面，建议拜神祈求保佑。本人可能多变动，及遭遇意外之灾。'
  },
  {
    key: '4=文曲D',
    palace: '子女宫',
    star: '文曲',
    hua: 'D',
    interpretation: '子女宫文曲化忌 主因感情或金钱问题而频繁迁居。也主本人桃花纠葛较多。'
  },
  {
    key: '4=天同D',
    palace: '子女宫',
    star: '天同',
    hua: 'D',
    interpretation: '子女宫天同化忌 主子女有福却难以享受，喜欢劳碌。本人可能在外忙碌，而无法享受家庭的幸福。'
  },
  {
    key: '4=文昌D',
    palace: '子女宫',
    star: '文昌',
    hua: 'D',
    interpretation: '子女宫文昌化忌 子女在事理上可能表现出过于极端的现象。'
  },
  {
    key: '4=武曲D',
    palace: '子女宫',
    star: '武曲',
    hua: 'D',
    interpretation: '子女宫武曲化忌 主子女数量可能较少，尤其需注意流产的风险，务必向神明祈求保佑。'
  },
  {
    key: '4=贪狼D',
    palace: '子女宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '子女宫贪狼化忌 主本人桃花较多，性生活频繁，可能导致身体健康受损。'
  },

  // 财帛宫生年四化解释（36条）
  {
    key: '5=廉贞A',
    palace: '财帛宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '财帛宫廉贞化禄 主财运顺利，赚钱能力强。通常与公家机构的财务有关，不必担心坏账，财源稳定，自有权力支配收支。桃花星的影响可能会导致赚取或支出桃花财，财务的进出与桃花有一定关系，适合冒险和投机。'
  },
  {
    key: '5=天机A',
    palace: '财帛宫',
    star: '天机',
    hua: 'A',
    interpretation: '财帛宫天机化禄 天机为智慧之星，化禄时，依靠智慧和机灵来赚钱。财务流动性大，遇到好运时可以大进大出，遇到不利时则可能是短暂的财富。资金流动频繁，需灵活运用，确保不闲置。'
  },
  {
    key: '5=天同A',
    palace: '财帛宫',
    star: '天同',
    hua: 'A',
    interpretation: '财帛宫天同化禄 财运较好，但主人可能缺乏积极性，懒于赚钱。天同不喜化禄，反而可能表现出无所作为。'
  },
  {
    key: '5=太阴A',
    palace: '财帛宫',
    star: '太阴',
    hua: 'A',
    interpretation: '财帛宫太阴化禄 主财源来自远方，通常受到异性帮助。男性可能多得女性的支持，女性则可能拥有老板的气质和实权。太阴旺守时财富丰厚，但若遭遇煞星冲击，可能导致财富的大进大出。'
  },
  {
    key: '5=贪狼A',
    palace: '财帛宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '财帛宫贪狼化禄 主财运良好，能够如愿赚钱。在赚钱过程中可能需要应酬和社交，涉及一些桃花运。偏财运较好，可能会有投机的机会。'
  },
  {
    key: '5=武曲A',
    palace: '财帛宫',
    star: '武曲',
    hua: 'A',
    interpretation: '财帛宫武曲化禄 武曲为正财星，化禄后财运顺利，生财有道，一生不欠债。'
  },
  {
    key: '5=太阳A',
    palace: '财帛宫',
    star: '太阳',
    hua: 'A',
    interpretation: '财帛宫太阳化禄 主人有老板气质，且具有实权。努力工作中获得财富，善于理财和花钱，尤其重视面子。若太阳落陷，可能在财务上会较为辛苦，但仍能善于理财。'
  },
  {
    key: '5=巨门A',
    palace: '财帛宫',
    star: '巨门',
    hua: 'A',
    interpretation: '财帛宫巨门化禄 巨门化禄通过口才和竞争获得财富，适合从事播音员、律师、推销员等职业。因巨门不主财，需依赖口才争取收入。'
  },
  {
    key: '5=天梁A',
    palace: '财帛宫',
    star: '天梁',
    hua: 'A',
    interpretation: '财帛宫天梁化禄 天梁主荫，不主财，化禄时可能因长辈的庇护而获得财富。另一种财源可能来自于自我宣传和展示实力，适合投资和赌博。'
  },
  {
    key: '5=破军A',
    palace: '财帛宫',
    star: '破军',
    hua: 'A',
    interpretation: '财帛宫破军化禄 破军的财运主要是意外之财，可能伴随风险和借贷。获得财富的同时也需付出辛劳，得失常常相伴，可能依赖朋友的帮助。桃花运可能与金钱有关。'
  },
  {
    key: '5=破军B',
    palace: '财帛宫',
    star: '破军',
    hua: 'B',
    interpretation: '财帛宫破军化权 破军的财运来得快去得也快，尽管化权能有所帮助，但需注意煞星的影响，以防资金周转不灵。'
  },
  {
    key: '5=天梁B',
    palace: '财帛宫',
    star: '天梁',
    hua: 'B',
    interpretation: '财帛宫天梁化权 主辛勤工作能守财，可能受到长辈的约束。天梁化权意味着需要通过努力经营或借助长辈的权力来管理财务。'
  },
  {
    key: '5=天机B',
    palace: '财帛宫',
    star: '天机',
    hua: 'B',
    interpretation: '财帛宫天机化权 主善于财务的规划和调度，若不遇凶星，能获得财富，但不会让资金闲置，总是想办法让资金流动。'
  },
  {
    key: '5=天同B',
    palace: '财帛宫',
    star: '天同',
    hua: 'B',
    interpretation: '财帛宫天同化权 主财运良好，创业容易，能比预期获得更多的收益，但需注意可能的超支现象。'
  },
  {
    key: '5=太阴B',
    palace: '财帛宫',
    star: '太阴',
    hua: 'B',
    interpretation: '财帛宫太阴化权 女性可能具备创业能力，辛勤努力会获得成功。太阴旺守时财富会不断增加，善于运用资金，可能会购买不动产。若太阴失辉，可能会有私藏金钱的情况。'
  },
  {
    key: '5=贪狼B',
    palace: '财帛宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '财帛宫贪狼化权 主创业能力强，能够快速获得成功，但需注意因个人生活方式而造成的财务损失。'
  },
  {
    key: '5=武曲B',
    palace: '财帛宫',
    star: '武曲',
    hua: 'B',
    interpretation: '财帛宫武曲化权 财星与权力结合，财运旺盛，善于从各种资金工具中获利。需注意煞星的影响，避免不必要的争端。'
  },
  {
    key: '5=太阳B',
    palace: '财帛宫',
    star: '太阳',
    hua: 'B',
    interpretation: '财帛宫太阳化权 男性创业能力强，财运发展迅速，理财能力突出。若太阳失辉，可能在理财上存在不足。'
  },
  {
    key: '5=紫微B',
    palace: '财帛宫',
    star: '紫微',
    hua: 'B',
    interpretation: '财帛宫紫微化权 紫微化权主创业能力强，理财有道，能够获得公门之财，享受财富的同时，也有贵人相助。'
  },
  {
    key: '5=巨门B',
    palace: '财帛宫',
    star: '巨门',
    hua: 'B',
    interpretation: '财帛宫巨门化权 无煞星影响，依靠口才和竞争获得财富。若遇到煞星，可能因财务问题而引发争执。'
  },
  {
    key: '5=紫微C',
    palace: '财帛宫',
    star: '紫微',
    hua: 'C',
    interpretation: '财帛宫紫微化科 主有贵人相助，公门之财稳固，能享受财富带来的福气。'
  },
  {
    key: '5=文昌C',
    palace: '财帛宫',
    star: '文昌',
    hua: 'C',
    interpretation: '财帛宫文昌化科 可能会出现分期付款的情况，若遇煞星，容易发生退票。'
  },
  {
    key: '5=天机C',
    palace: '财帛宫',
    star: '天机',
    hua: 'C',
    interpretation: '财帛宫天机化科 适合从事与金钱和账目相关的工作，如会计师、出纳等，资金流动性大。'
  },
  {
    key: '5=右弼C',
    palace: '财帛宫',
    star: '右弼',
    hua: 'C',
    interpretation: '财帛宫右弼化科 主得贵人相助，能够在获利和借贷上达成目标。'
  },
  {
    key: '5=天梁C',
    palace: '财帛宫',
    star: '天梁',
    hua: 'C',
    interpretation: '财帛宫天梁化科 经常有赠予，无论是送人还是接受他人赠予，属于不劳而获的情况。'
  },
  {
    key: '5=太阴C',
    palace: '财帛宫',
    star: '太阴',
    hua: 'C',
    interpretation: '财帛宫太阴化科 主要通过女性获得财富，太阴旺守时富足，失辉则仅够用，常有小额暗财进账。'
  },
  {
    key: '5=文曲C',
    palace: '财帛宫',
    star: '文曲',
    hua: 'C',
    interpretation: '财帛宫文曲化科 可能会出现分期付款的情况，若遇煞星，容易发生退票。'
  },
  {
    key: '5=左辅C',
    palace: '财帛宫',
    star: '左辅',
    hua: 'C',
    interpretation: '财帛宫左辅化科 主得贵人相助，能够顺利获利和借贷，左辅提供直接的帮助。'
  },
  {
    key: '5=武曲C',
    palace: '财帛宫',
    star: '武曲',
    hua: 'C',
    interpretation: '财帛宫武曲化科 财务收入稳定，不易受困，量入为出，适合以技术和名气谋生，通常为上班族，化科为清白之财。'
  },
  {
    key: '5=太阳D',
    palace: '财帛宫',
    star: '太阳',
    hua: 'D',
    interpretation: '财帛宫太阳化忌 男性创业运势不佳，女性则可能面临配偶运势暗淡。无论男女，财务管理能力较弱，可能会忽视实际情况。太阳旺守时财运竞争激烈，但若失辉则财运暗淡，常伴随是非，财宫易受损。'
  },
  {
    key: '5=太阴D',
    palace: '财帛宫',
    star: '太阴',
    hua: 'D',
    interpretation: '财帛宫太阴化忌 女性创业能力不足。无论男女，太阴主财，化忌则可能导致财运受损，太阳失辉也会影响财务。'
  },
  {
    key: '5=廉贞D',
    palace: '财帛宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '财帛宫廉贞化忌 主财务方面可能面临是非麻烦，特别是与金钱有关的官司。如有桃花星，需注意桃花对财务的影响，建议避免赌博。'
  },
  {
    key: '5=巨门D',
    palace: '财帛宫',
    star: '巨门',
    hua: 'D',
    interpretation: '财帛宫巨门化忌 主财务上可能出现口舌是非，若遇法律星，则需注意因财务问题引发的争讼。'
  },
  {
    key: '5=天机D',
    palace: '财帛宫',
    star: '天机',
    hua: 'D',
    interpretation: '财帛宫天机化忌 财务管理上可能面临挑战，需费尽心思，可能导致资金的严重波动。通过智慧和天赋赚取的财富可能会受到影响。'
  },
  {
    key: '5=文曲D',
    palace: '财帛宫',
    star: '文曲',
    hua: 'D',
    interpretation: '财帛宫文曲化忌 文曲主金钱和感情，化忌则可能导致财务和感情上的损失。容易出现资金滞留的现象，如购买畅销商品后滞销，或应收账款变为呆账，需特别注意财务凭证和数据的处理。'
  },
  {
    key: '5=天同D',
    palace: '财帛宫',
    star: '天同',
    hua: 'D',
    interpretation: '财帛宫天同化忌 主赚钱不易，财务协调问题较多，可能导致开支紧缩和延迟付款。'
  },
  {
    key: '5=文昌D',
    palace: '财帛宫',
    star: '文昌',
    hua: 'D',
    interpretation: '财帛宫文昌化忌 财务凭证和数据容易出现问题，需特别关注处理细节。若不加煞，情况较轻，但在财务管理上需多费心。'
  },
  {
    key: '5=武曲D',
    palace: '财帛宫',
    star: '武曲',
    hua: 'D',
    interpretation: '财帛宫武曲化忌 武曲为财星，化忌则可能导致财务损失，生活中可能因财务问题产生争端。'
  },
  {
    key: '5=贪狼D',
    palace: '财帛宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '财帛宫贪狼化忌 主财务不顺，可能因桃色纠纷而导致财务损失。贪狼的财务损失可能是隐性的，难以察觉，且可能因追求更高目标而忽视现有财务状况。'
  },

  // 疾厄宫生年四化解释（39条）
  {
    key: '6=廉贞A',
    palace: '疾厄宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '疾厄宫廉贞化禄 次桃花、性需求强，喜欢香气浓郁的事物，可能存在贪求的倾向。'
  },
  {
    key: '6=天机A',
    palace: '疾厄宫',
    star: '天机',
    hua: 'A',
    interpretation: '疾厄宫天机化禄 主智慧，做事考虑周全，圆融得体。'
  },
  {
    key: '6=天同A',
    palace: '疾厄宫',
    star: '天同',
    hua: 'A',
    interpretation: '疾厄宫天同化禄 主福气，身体健康，能够化解困难；天同化禄有助于在危难时刻得到解救。'
  },
  {
    key: '6=太阴A',
    palace: '疾厄宫',
    star: '太阴',
    hua: 'A',
    interpretation: '疾厄宫太阴化禄 主心地善良，内心柔软。若太阴失辉，可能会感到忧虑，并倾向于自我反思以解开心结。缺乏实权，可能存在内分泌失调的隐患。'
  },
  {
    key: '6=贪狼A',
    palace: '疾厄宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '疾厄宫贪狼化禄 主解厄，寿命长，桃花运旺盛，因性欲较强而渴望桃花。需注意肝脏健康。'
  },
  {
    key: '6=武曲A',
    palace: '疾厄宫',
    star: '武曲',
    hua: 'A',
    interpretation: '疾厄宫武曲化禄 主外柔内刚，能化解病痛和灾厄。可能与呼吸系统疾病有关。'
  },
  {
    key: '6=太阳A',
    palace: '疾厄宫',
    star: '太阳',
    hua: 'A',
    interpretation: '疾厄宫太阳化禄 主人性格开朗，心地善良，过于随和，视力良好，桃花运较好。'
  },
  {
    key: '6=巨门A',
    palace: '疾厄宫',
    star: '巨门',
    hua: 'A',
    interpretation: '疾厄宫巨门化禄 主口福不错，但需注意肠胃健康。女性命主不宜与文昌或文曲同宫，以免引发不必要的情感纠葛。'
  },
  {
    key: '6=天梁A',
    palace: '疾厄宫',
    star: '天梁',
    hua: 'A',
    interpretation: '疾厄宫天梁化禄 主寿命长，能得到长辈的庇护，身体健康，遇到困难时可得到帮助。需关注肠胃健康及乳腺问题。'
  },
  {
    key: '6=破军A',
    palace: '疾厄宫',
    star: '破军',
    hua: 'A',
    interpretation: '疾厄宫破军化禄 喜欢消费，小时候身体较弱，随着年龄增长逐渐健康。需注意适度消费，保持身体健康。'
  },
  {
    key: '6=破军B',
    palace: '疾厄宫',
    star: '破军',
    hua: 'B',
    interpretation: '疾厄宫破军化权 主文书工作繁重，性格独特。'
  },
  {
    key: '6=天梁B',
    palace: '疾厄宫',
    star: '天梁',
    hua: 'B',
    interpretation: '疾厄宫天梁化权 主父母管教严格，自己言语调皮或有些霸道。'
  },
  {
    key: '6=天机B',
    palace: '疾厄宫',
    star: '天机',
    hua: 'B',
    interpretation: '疾厄宫天机化权 主肝脏健康需注意，易感染流行病，四肢易受伤。聪明活泼，喜欢改善文书工作。'
  },
  {
    key: '6=天同B',
    palace: '疾厄宫',
    star: '天同',
    hua: 'B',
    interpretation: '疾厄宫天同化权 主有寿福，身体健康，能化解困难。'
  },
  {
    key: '6=太阴B',
    palace: '疾厄宫',
    star: '太阴',
    hua: 'B',
    interpretation: '疾厄宫太阴化权 主人心情常忧虑，固执难以劝解，太阴失辉时更为明显，内心感到困扰，不愿与他人分享。'
  },
  {
    key: '6=贪狼B',
    palace: '疾厄宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '疾厄宫贪狼化权 贪狼为寿星，化权时不宜入疾厄，可能有外伤，性格顽固，喜欢掌权，桃花运旺盛。'
  },
  {
    key: '6=武曲B',
    palace: '疾厄宫',
    star: '武曲',
    hua: 'B',
    interpretation: '疾厄宫武曲化权 武曲为将星，化权不宜入疾厄，身体健康可能多有波折，尤其女性可能面临流产风险。'
  },
  {
    key: '6=太阳B',
    palace: '疾厄宫',
    star: '太阳',
    hua: 'B',
    interpretation: '疾厄宫太阳化权 太阳主官禄，化权不宜入疾厄，可能面临多种挑战，尤其在太阳失辉时，可能感到自卑。创业能力较弱。'
  },
  {
    key: '6=紫微B',
    palace: '疾厄宫',
    star: '紫微',
    hua: 'B',
    interpretation: '疾厄宫紫微化权 紫微为官禄主，化权良好，但不宜入疾厄，可能身体多有疾病，创业能力不足。紫微需化科才能解厄。'
  },
  {
    key: '6=巨门B',
    palace: '疾厄宫',
    star: '巨门',
    hua: 'B',
    interpretation: '疾厄宫巨门化权 主与小人多有争执，需注意文书工作带来的压力。'
  },
  {
    key: '6=紫微C',
    palace: '疾厄宫',
    star: '紫微',
    hua: 'C',
    interpretation: '疾厄宫紫微化科 主有贵人相助，身体健康，纵使遇到灾病，定能得到贵人相救。'
  },
  {
    key: '6=天机C',
    palace: '疾厄宫',
    star: '天机',
    hua: 'C',
    interpretation: '疾厄宫天机化科 主对宗教、阴阳学和哲学有兴趣。'
  },
  {
    key: '6=左辅C',
    palace: '疾厄宫',
    star: '左辅',
    hua: 'C',
    interpretation: '疾厄宫左辅化科 主能解厄，带来好运。'
  },
  {
    key: '6=右弼C',
    palace: '疾厄宫',
    star: '右弼',
    hua: 'C',
    interpretation: '疾厄宫右弼化科 主能解厄，带来好运。'
  },
  {
    key: '6=文昌C',
    palace: '疾厄宫',
    star: '文昌',
    hua: 'C',
    interpretation: '疾厄宫文昌化科 主能解厄，带来好运。'
  },
  {
    key: '6=文曲C',
    palace: '疾厄宫',
    star: '文曲',
    hua: 'C',
    interpretation: '疾厄宫文曲化科 主能解厄，带来好运。'
  },
  {
    key: '6=天梁C',
    palace: '疾厄宫',
    star: '天梁',
    hua: 'C',
    interpretation: '疾厄宫天梁化科 主有贵人相助，能解厄，医疗上有良方。'
  },
  {
    key: '6=太阴C',
    palace: '疾厄宫',
    star: '太阴',
    hua: 'C',
    interpretation: '疾厄宫太阴化科 主有贵人相助，能解厄，医疗上有良方。'
  },
  {
    key: '6=武曲C',
    palace: '疾厄宫',
    star: '武曲',
    hua: 'C',
    interpretation: '疾厄宫武曲化科 主有贵人相助，能解厄，医疗上有良方。'
  },
  {
    key: '6=太阳D',
    palace: '疾厄宫',
    star: '太阳',
    hua: 'D',
    interpretation: '疾厄宫太阳化忌 太阳主个性，化忌可能导致内心焦虑，易引发脑溢血、高血压、精神疲劳、视力问题等。'
  },
  {
    key: '6=太阴D',
    palace: '疾厄宫',
    star: '太阴',
    hua: 'D',
    interpretation: '疾厄宫太阴化忌 太阴主阴湿，可能引发相关疾病。女性可能面临妇科问题。太阴化忌主眼疾，太阳主左眼，太阴主右眼，化忌的星体可能影响相应眼睛的健康。'
  },
  {
    key: '6=廉贞D',
    palace: '疾厄宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '疾厄宫廉贞化忌 这颗星可能带来一些麻烦，化忌后可能出现疑难杂症，甚至严重疾病。需谨慎，特别是在意外事故和情感方面，建议保持警惕。'
  },
  {
    key: '6=巨门D',
    palace: '疾厄宫',
    star: '巨门',
    hua: 'D',
    interpretation: '疾厄宫巨门化忌 主可能面临难以治疗的疾病，或与阴宅相关的健康问题，建议寻求专业帮助。可能因长舌和多管闲事而引发争议，与母亲的关系可能较为疏远。'
  },
  {
    key: '6=天机D',
    palace: '疾厄宫',
    star: '天机',
    hua: 'D',
    interpretation: '疾厄宫天机化忌 主可能面临头疼、脑神经等健康问题，可能与父亲的关系较为疏远。'
  },
  {
    key: '6=文曲D',
    palace: '疾厄宫',
    star: '文曲',
    hua: 'D',
    interpretation: '疾厄宫文曲化忌 主因情感问题而感到忧郁，可能出现心病和眼疾。女性可能面临流产风险，情绪、神经和精神健康需特别关注。'
  },
  {
    key: '6=天同D',
    palace: '疾厄宫',
    star: '天同',
    hua: 'D',
    interpretation: '疾厄宫天同化忌 天同化忌时可能无解厄之功，身体健康状况不佳，过度操心可能导致健康进一步恶化，通常与膀胱、肾脏问题相关。女性可能面临月经不调。'
  },
  {
    key: '6=文昌D',
    palace: '疾厄宫',
    star: '文昌',
    hua: 'D',
    interpretation: '疾厄宫文昌化忌 主可能面临肺部、咳嗽等问题，情绪和精神健康需多加关注。'
  },
  {
    key: '6=武曲D',
    palace: '疾厄宫',
    star: '武曲',
    hua: 'D',
    interpretation: '疾厄宫武曲化忌 主可能感到压抑，可能面临金属器械造成的伤害，呼吸系统疾病需特别注意。'
  },
  {
    key: '6=贪狼D',
    palace: '疾厄宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '疾厄宫贪狼化忌 主欲望较高，需注意相关健康问题。'
  },

  // 迁移宫生年四化解释（39条）
  {
    key: '7=廉贞A',
    palace: '迁移宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '迁移宫廉贞化禄 主外出时能得到异性的帮助，且异性缘分较厚。若在运势中遇到廉贞星，可能会有喜庆或浪漫的机会。'
  },
  {
    key: '7=天机A',
    palace: '迁移宫',
    star: '天机',
    hua: 'A',
    interpretation: '迁移宫天机化禄 主远行、迁居，适合在外打拼，常有独到的见解。'
  },
  {
    key: '7=天同A',
    palace: '迁移宫',
    star: '天同',
    hua: 'A',
    interpretation: '迁移宫天同化禄 主在外享受生活，为人乐观，待人友善，但可能缺乏进取心。'
  },
  {
    key: '7=太阴A',
    palace: '迁移宫',
    star: '太阴',
    hua: 'A',
    interpretation: '迁移宫太阴化禄 喜欢旅游，亲近自然。因太阴主田宅，您可能更倾向于在外寻找舒适的居所，财运良好。'
  },
  {
    key: '7=贪狼A',
    palace: '迁移宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '迁移宫贪狼化禄 主聪明，外出时受欢迎，常有美食和桃花运，适合投机和偏财。'
  },
  {
    key: '7=武曲A',
    palace: '迁移宫',
    star: '武曲',
    hua: 'A',
    interpretation: '迁移宫武曲化禄 具备领导才能，外出时能够获得财富，适合在他乡发展。'
  },
  {
    key: '7=太阳A',
    palace: '迁移宫',
    star: '太阳',
    hua: 'A',
    interpretation: '迁移宫太阳化禄 主声名显赫，喜爱远行；若为雇员，则有机会担任主管，掌握实权。'
  },
  {
    key: '7=巨门A',
    palace: '迁移宫',
    star: '巨门',
    hua: 'A',
    interpretation: '迁移宫巨门化禄 主口才出众，擅长交际和辩论，能够白手起家。'
  },
  {
    key: '7=天梁A',
    palace: '迁移宫',
    star: '天梁',
    hua: 'A',
    interpretation: '迁移宫天梁化禄 主外出时能得到长辈的支持与关爱，处事圆滑，善于沟通。'
  },
  {
    key: '7=破军A',
    palace: '迁移宫',
    star: '破军',
    hua: 'A',
    interpretation: '迁移宫破军化禄 富有创意，擅长开创事业，专业技能出众，适合经商，但需注意外出消费较大。'
  },
  {
    key: '7=破军B',
    palace: '迁移宫',
    star: '破军',
    hua: 'B',
    interpretation: '迁移宫破军化权 主奔波不息，尤其在四马地时，活动频繁。'
  },
  {
    key: '7=天梁B',
    palace: '迁移宫',
    star: '天梁',
    hua: 'B',
    interpretation: '迁移宫天梁化权 主在外有领导地位，喜欢带领团队。'
  },
  {
    key: '7=天机B',
    palace: '迁移宫',
    star: '天机',
    hua: 'B',
    interpretation: '迁移宫天机化权 主远行，若在四马地，再遇天马，可能会有计划性出国的机会。'
  },
  {
    key: '7=天同B',
    palace: '迁移宫',
    star: '天同',
    hua: 'B',
    interpretation: '迁移宫天同化权 主在外有福气可享。'
  },
  {
    key: '7=太阴B',
    palace: '迁移宫',
    star: '太阴',
    hua: 'B',
    interpretation: '迁移宫太阴化权 女性命主可创业，努力工作并掌握实权；男性命主外出时，常有与女性圈子相交的机会。'
  },
  {
    key: '7=贪狼B',
    palace: '迁移宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '迁移宫贪狼化权 主喜欢掌权，充满活力，外出时热情好客，桃花运旺盛。'
  },
  {
    key: '7=武曲B',
    palace: '迁移宫',
    star: '武曲',
    hua: 'B',
    interpretation: '迁移宫武曲化权 主在创业中忙碌，勤奋努力。'
  },
  {
    key: '7=太阳B',
    palace: '迁移宫',
    star: '太阳',
    hua: 'B',
    interpretation: '迁移宫太阳化权 男性命主适合创业并掌握实权，若太阳失辉，可能会辛苦奔波；女性在外也比较忙碌，常接触男性。'
  },
  {
    key: '7=紫微B',
    palace: '迁移宫',
    star: '紫微',
    hua: 'B',
    interpretation: '迁移宫紫微化权 主外出时能得到贵人的帮助，适合发展，但若无左右会照，则局面较小。'
  },
  {
    key: '7=巨门B',
    palace: '迁移宫',
    star: '巨门',
    hua: 'B',
    interpretation: '迁移宫巨门化权 主外出时可以通过口才谋生，交际广泛，但需谨慎与人深交，避免因权争而生纠纷。'
  },
  {
    key: '7=武曲C',
    palace: '迁移宫',
    star: '武曲',
    hua: 'C',
    interpretation: '迁移宫武曲化科 贵人在外，适合外出发展。'
  },
  {
    key: '7=紫微C',
    palace: '迁移宫',
    star: '紫微',
    hua: 'C',
    interpretation: '迁移宫紫微化科 贵人在外，适合外出发展。'
  },
  {
    key: '7=文昌C',
    palace: '迁移宫',
    star: '文昌',
    hua: 'C',
    interpretation: '迁移宫文昌化科 贵人在外，适合外出发展。'
  },
  {
    key: '7=天机C',
    palace: '迁移宫',
    star: '天机',
    hua: 'C',
    interpretation: '迁移宫天机化科 贵人在外，适合外出发展。'
  },
  {
    key: '7=右弼C',
    palace: '迁移宫',
    star: '右弼',
    hua: 'C',
    interpretation: '迁移宫右弼化科 贵人在外，适合外出发展。'
  },
  {
    key: '7=天梁C',
    palace: '迁移宫',
    star: '天梁',
    hua: 'C',
    interpretation: '迁移宫天梁化科 贵人在外，适合外出发展。'
  },
  {
    key: '7=文曲C',
    palace: '迁移宫',
    star: '文曲',
    hua: 'C',
    interpretation: '迁移宫文曲化科 贵人在外，适合外出发展。'
  },
  {
    key: '7=左辅C',
    palace: '迁移宫',
    star: '左辅',
    hua: 'C',
    interpretation: '迁移宫左辅化科 贵人在外，适合外出发展。'
  },
  {
    key: '7=太阴C',
    palace: '迁移宫',
    star: '太阴',
    hua: 'C',
    interpretation: '迁移宫太阴化科 喜欢存私房钱，较不容易被发现，配偶也较不在意。主老年有财可享，贵人在外，适合外出发展。'
  },
  {
    key: '7=太阳D',
    palace: '迁移宫',
    star: '太阳',
    hua: 'D',
    interpretation: '迁移宫太阳化忌 若坐迁移冲命，可能会遇到灾厄，外出辛劳且招惹是非，耗尽精力而不想回家。'
  },
  {
    key: '7=太阴D',
    palace: '迁移宫',
    star: '太阴',
    hua: 'D',
    interpretation: '迁移宫太阴化忌 在外容易遭遇小人暗算，或与女性关系不佳。需注意金钱损失，或因女性而破财。'
  },
  {
    key: '7=廉贞D',
    palace: '迁移宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '迁移宫廉贞化忌 可能会遭遇意外事故、交通罚款，外出时易招惹桃色纠纷。'
  },
  {
    key: '7=巨门D',
    palace: '迁移宫',
    star: '巨门',
    hua: 'D',
    interpretation: '迁移宫巨门化忌 在外可能会招惹口舌是非。'
  },
  {
    key: '7=天机D',
    palace: '迁移宫',
    star: '天机',
    hua: 'D',
    interpretation: '迁移宫天机化忌 可能面临手足萎缩或麻痹现象，需注意交通事故和外伤。'
  },
  {
    key: '7=文曲D',
    palace: '迁移宫',
    star: '文曲',
    hua: 'D',
    interpretation: '迁移宫文曲化忌 在外可能会遭遇感情问题，付款时可能出现小插曲。'
  },
  {
    key: '7=天同D',
    palace: '迁移宫',
    star: '天同',
    hua: 'D',
    interpretation: '迁移宫天同化忌 外出时常有协调不良的情况，容易造成精力耗尽，无法享受生活。'
  },
  {
    key: '7=文昌D',
    palace: '迁移宫',
    star: '文昌',
    hua: 'D',
    interpretation: '迁移宫文昌化忌 外出时需小心被骗，注意虚假之人、事、物。'
  },
  {
    key: '7=武曲D',
    palace: '迁移宫',
    star: '武曲',
    hua: 'D',
    interpretation: '迁移宫武曲化忌 与命宫相同，适合修行、接近佛道，主张自立自助。外出时可能会有财务损失，或因金钱产生冲突。'
  },
  {
    key: '7=贪狼D',
    palace: '迁移宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '迁移宫贪狼化忌 喜欢外出寻求桃花，可能会有风流韵事，需小心可能的麻烦。女性命主尤其需谨慎。'
  },

  // 交友宫生年四化解释（39条）
  {
    key: '8=廉贞A',
    palace: '交友宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '交友宫廉贞化禄 主与朋友交往频繁，可能会接触到一些不良嗜好，如饮酒和赌博，朋友多为个性张扬的人。广泛交友，涉及各行各业，能从朋友那里获得财富。'
  },
  {
    key: '8=天机A',
    palace: '交友宫',
    star: '天机',
    hua: 'A',
    interpretation: '交友宫天机化禄 主与朋友因缘分相识，虽然彼此关系亲密，但相交如水。朋友多为年龄相仿的男性，交往频繁。'
  },
  {
    key: '8=天同A',
    palace: '交友宫',
    star: '天同',
    hua: 'A',
    interpretation: '交友宫天同化禄 主与朋友相处愉快，享受生活，关系随和，能够获得朋友的支持和帮助。'
  },
  {
    key: '8=太阴A',
    palace: '交友宫',
    star: '太阴',
    hua: 'A',
    interpretation: '交友宫太阴化禄 主与朋友共享快乐，关心朋友。男性命主桃花运较好，女性则能得到女性朋友的支持。'
  },
  {
    key: '8=贪狼A',
    palace: '交友宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '交友宫贪狼化禄 主慷慨好客，常请朋友聚会，享受生活，桃花运旺盛，饮食方面朋友众多。'
  },
  {
    key: '8=武曲A',
    palace: '交友宫',
    star: '武曲',
    hua: 'A',
    interpretation: '交友宫武曲化禄 主与朋友交际应酬，享受生活，主要与财务相关。为朋友奔波劳累，但也能从中获得利益。'
  },
  {
    key: '8=太阳A',
    palace: '交友宫',
    star: '太阳',
    hua: 'A',
    interpretation: '交友宫太阳化禄 主交际应酬频繁，虽然可能是老板，但未必拥有实权，或只是合伙经营。'
  },
  {
    key: '8=巨门A',
    palace: '交友宫',
    star: '巨门',
    hua: 'A',
    interpretation: '交友宫巨门化禄 主口才出众，享受美食，与朋友相处愉快。如果朋友帮助创业，需心存感激，否则可能会有是非。'
  },
  {
    key: '8=天梁A',
    palace: '交友宫',
    star: '天梁',
    hua: 'A',
    interpretation: '交友宫天梁化禄 主尊重年长且正派的朋友，能得到他们的支持。但需警惕一些喜欢夸耀的朋友，以免被连累。'
  },
  {
    key: '8=破军A',
    palace: '交友宫',
    star: '破军',
    hua: 'A',
    interpretation: '交友宫破军化禄 主人缘极好，朋友的支持力度大。'
  },
  {
    key: '8=破军B',
    palace: '交友宫',
    star: '破军',
    hua: 'B',
    interpretation: '交友宫破军化权 主在朋友中有一定的影响力，能够获得帮助。'
  },
  {
    key: '8=天梁B',
    palace: '交友宫',
    star: '天梁',
    hua: 'B',
    interpretation: '交友宫天梁化权 主与年长朋友关系良好，但需注意结交的朋友可能夸大其词，表现得像专家或好人。'
  },
  {
    key: '8=天机B',
    palace: '交友宫',
    star: '天机',
    hua: 'B',
    interpretation: '交友宫天机化权 主朋友多为智慧之士，若有煞忌冲，则可能需要比拼智力。'
  },
  {
    key: '8=天同B',
    palace: '交友宫',
    star: '天同',
    hua: 'B',
    interpretation: '交友宫天同化权 主朋友众多，且多为懂得享受生活的人。'
  },
  {
    key: '8=太阴B',
    palace: '交友宫',
    star: '太阴',
    hua: 'B',
    interpretation: '交友宫太阴化权 主女性朋友较多，且多为勤奋、能创业的类型。'
  },
  {
    key: '8=贪狼B',
    palace: '交友宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '交友宫贪狼化权 主异性缘佳，性格活泼，有冲劲，可能在饮酒和享乐方面表现突出。'
  },
  {
    key: '8=武曲B',
    palace: '交友宫',
    star: '武曲',
    hua: 'B',
    interpretation: '交友宫武曲化权 主朋友个性强烈，且多为金融行业的朋友。'
  },
  {
    key: '8=太阳B',
    palace: '交友宫',
    star: '太阳',
    hua: 'B',
    interpretation: '交友宫太阳化权 主男性朋友较多，且多为老板或主管。'
  },
  {
    key: '8=紫微B',
    palace: '交友宫',
    star: '紫微',
    hua: 'B',
    interpretation: '交友宫紫微化权 主交往的朋友多为公务员。'
  },
  {
    key: '8=巨门B',
    palace: '交友宫',
    star: '巨门',
    hua: 'B',
    interpretation: '交友宫巨门化权 主容易与朋友产生争论，或卷入朋友的麻烦中。'
  },
  {
    key: '8=武曲C',
    palace: '交友宫',
    star: '武曲',
    hua: 'C',
    interpretation: '交友宫武曲化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=紫微C',
    palace: '交友宫',
    star: '紫微',
    hua: 'C',
    interpretation: '交友宫紫微化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=文昌C',
    palace: '交友宫',
    star: '文昌',
    hua: 'C',
    interpretation: '交友宫文昌化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=天机C',
    palace: '交友宫',
    star: '天机',
    hua: 'C',
    interpretation: '交友宫天机化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=右弼C',
    palace: '交友宫',
    star: '右弼',
    hua: 'C',
    interpretation: '交友宫右弼化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=天梁C',
    palace: '交友宫',
    star: '天梁',
    hua: 'C',
    interpretation: '交友宫天梁化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=太阴C',
    palace: '交友宫',
    star: '太阴',
    hua: 'C',
    interpretation: '交友宫太阴化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=文曲C',
    palace: '交友宫',
    star: '文曲',
    hua: 'C',
    interpretation: '交友宫文曲化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=左辅C',
    palace: '交友宫',
    star: '左辅',
    hua: 'C',
    interpretation: '交友宫左辅化科 主能得到朋友的支持，交往的朋友多为文雅之人，且自己也不损害朋友。'
  },
  {
    key: '8=太阳D',
    palace: '交友宫',
    star: '太阳',
    hua: 'D',
    interpretation: '交友宫太阳化忌 主男性朋友关系不佳。'
  },
  {
    key: '8=太阴D',
    palace: '交友宫',
    star: '太阴',
    hua: 'D',
    interpretation: '交友宫太阴化忌 主女性朋友关系不佳。'
  },
  {
    key: '8=廉贞D',
    palace: '交友宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '交友宫廉贞化忌 主与朋友关系多有麻烦，可能涉及官司，朋友中有些人性格不成熟。'
  },
  {
    key: '8=巨门D',
    palace: '交友宫',
    star: '巨门',
    hua: 'D',
    interpretation: '交友宫巨门化忌 主与朋友之间容易产生口角和麻烦。'
  },
  {
    key: '8=天机D',
    palace: '交友宫',
    star: '天机',
    hua: 'D',
    interpretation: '交友宫天机化忌 主与朋友之间缺乏缘分，彼此心存机心，难以坦诚相待。'
  },
  {
    key: '8=文曲D',
    palace: '交友宫',
    star: '文曲',
    hua: 'D',
    interpretation: '交友宫文曲化忌 主朋友间常发生感情问题。'
  },
  {
    key: '8=天同D',
    palace: '交友宫',
    star: '天同',
    hua: 'D',
    interpretation: '交友宫天同化忌 主与朋友之间常有不和谐的协商。'
  },
  {
    key: '8=文昌D',
    palace: '交友宫',
    star: '文昌',
    hua: 'D',
    interpretation: '交友宫文昌化忌 主与朋友间常有文书方面的麻烦。'
  },
  {
    key: '8=武曲D',
    palace: '交友宫',
    star: '武曲',
    hua: 'D',
    interpretation: '交友宫武曲化忌 主与朋友关系不合，甚至可能发生冲突。'
  },
  {
    key: '8=贪狼D',
    palace: '交友宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '交友宫贪狼化忌 与朋友之间常有桃花纠纷。'
  },

  // 官禄宫生年四化解释（39条）
  {
    key: '9=廉贞A',
    palace: '官禄宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '官禄宫廉贞化禄 主官禄顺利，工作上得心应手，同时也承担一定的权责。桃花运旺盛，若身宫在官禄，可能会得到异性的支持。适合从事军警行业，有机会掌握权力。'
  },
  {
    key: '9=天机A',
    palace: '官禄宫',
    star: '天机',
    hua: 'A',
    interpretation: '官禄宫天机化禄 擅长通过智慧获取财富，适合创业。可以从事哲学或宗教相关工作。若与凶星相遇，可能会显得华而不实。'
  },
  {
    key: '9=天同A',
    palace: '官禄宫',
    star: '天同',
    hua: 'A',
    interpretation: '官禄宫天同化禄 表现不佳，缺乏魄力，依赖运气，较难有所作为，可能会显得懒散，倾向于希望不劳而获。'
  },
  {
    key: '9=太阴A',
    palace: '官禄宫',
    star: '太阴',
    hua: 'A',
    interpretation: '官禄宫太阴化禄 男性命主可能有贤惠的伴侣，能够成为女老板。也可能是另一位女性掌管事业，因夫妻关系，男性主内，女性主外。女性命主有成为老板的潜力，并掌握实权。若太阴旺盛，事业顺利；若失去光辉，则可能晚成。适合从事理财工作。'
  },
  {
    key: '9=贪狼A',
    palace: '官禄宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '官禄宫贪狼化禄 主偏财运，带有投机和娱乐性质，工作中多得异性支持。'
  },
  {
    key: '9=武曲A',
    palace: '官禄宫',
    star: '武曲',
    hua: 'A',
    interpretation: '官禄宫武曲化禄 武曲化禄入官禄宫，主财运良好，工作顺利。适合从事金融相关的职位或事业，也可进入军警行业。'
  },
  {
    key: '9=太阳A',
    palace: '官禄宫',
    star: '太阳',
    hua: 'A',
    interpretation: '官禄宫太阳化禄 男性命主有成为老板的潜力，并掌握实权，若为上班族，也可能是有权力的主管。女性命主若有男性伴侣，亦可创业或担任公私营机构的主管。'
  },
  {
    key: '9=巨门A',
    palace: '官禄宫',
    star: '巨门',
    hua: 'A',
    interpretation: '官禄宫巨门化禄 主以口才为业，适合从事竞争性职业、文化传播、公关和销售。因工作环境的关系，常有口福。'
  },
  {
    key: '9=天梁A',
    palace: '官禄宫',
    star: '天梁',
    hua: 'A',
    interpretation: '官禄宫天梁化禄 受上司的宠爱与提拔，有机会获得高位。多得年长者的帮助和照顾。虽然地位较高，但工作上也较辛劳。'
  },
  {
    key: '9=破军A',
    palace: '官禄宫',
    star: '破军',
    hua: 'A',
    interpretation: '官禄宫破军化禄 能得到伴侣的支持，使工作和事业顺利。升迁依靠个人实力，虽然工作如意，但也需要努力。'
  },
  {
    key: '9=破军B',
    palace: '官禄宫',
    star: '破军',
    hua: 'B',
    interpretation: '官禄宫破军化权 事业中可能会有较大的变动，若无煞忌冲，主好的改变，且这些变化可控。建议重视授权，破军星为交友之王，若能充分授权并给予指导，事业将更为辉煌，且不必过度奔波。'
  },
  {
    key: '9=天梁B',
    palace: '官禄宫',
    star: '天梁',
    hua: 'B',
    interpretation: '官禄宫天梁化权 主个性直率，可能显得霸道但讲理。工作环境中，上司或老板可能比较严厉。需注意工作中可能存在的夸大其词的人或事情。'
  },
  {
    key: '9=天机B',
    palace: '官禄宫',
    star: '天机',
    hua: 'B',
    interpretation: '官禄宫天机化权 主对创业非常用心，能够运用智慧于事业中。具备改变工作的能力，追求创新。若有煞忌，则可能带来烦恼。'
  },
  {
    key: '9=天同B',
    palace: '官禄宫',
    star: '天同',
    hua: 'B',
    interpretation: '官禄宫天同化权 主创业依靠人际关系，以交际手腕获得机会，灵活应对。'
  },
  {
    key: '9=太阴B',
    palace: '官禄宫',
    star: '太阴',
    hua: 'B',
    interpretation: '官禄宫太阴化权 女性命主在创业过程中勤奋努力，因有才华而能掌握权力。可能掌握实权但无名位；若太阴失去光辉，可能会出现干预或滥用职权的情况。男性命主则多得女性的帮助。'
  },
  {
    key: '9=贪狼B',
    palace: '官禄宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '官禄宫贪狼化权 主创业，掌握潜在权力，积极进取，充满活力。适合从事娱乐行业，且有机会与异性建立良好关系。'
  },
  {
    key: '9=武曲B',
    palace: '官禄宫',
    star: '武曲',
    hua: 'B',
    interpretation: '官禄宫武曲化权 主财权兼得，适合从事武职或金融行业，职位较高。'
  },
  {
    key: '9=太阳B',
    palace: '官禄宫',
    star: '太阳',
    hua: 'B',
    interpretation: '官禄宫太阳化权 男性命主具备成为老板的潜力，掌握实权或担任主管。女性命主则有男性化的志向，喜欢出风头，适合从事政治、外交等重要职位，或成为民意代表。'
  },
  {
    key: '9=紫微B',
    palace: '官禄宫',
    star: '紫微',
    hua: 'B',
    interpretation: '官禄宫紫微化权 紫微星化权入官禄宫，主真正的官禄，能够掌握实权，并受到提拔，升迁迅速，职位越来越高。若在私人机构工作，也能得到支持。若有左右相会，事业更为顺利。紫微化权虽有助于升迁，但并无解厄之功用。'
  },
  {
    key: '9=巨门B',
    palace: '官禄宫',
    star: '巨门',
    hua: 'B',
    interpretation: '官禄宫巨门化权 以口才为业，言辞有分量，但可能显得过于强硬，某些人可能难以接受。适合从事法官、律师、教师等职业。若再遇煞忌或天刑，可能引发官司或刑讼。'
  },
  {
    key: '9=武曲C',
    palace: '官禄宫',
    star: '武曲',
    hua: 'C',
    interpretation: '官禄宫武曲化科 适合从事武职或金融行业，能够实现名利双收。'
  },
  {
    key: '9=紫微C',
    palace: '官禄宫',
    star: '紫微',
    hua: 'C',
    interpretation: '官禄宫紫微化科 适合公务人员。若自行创业，建议与政府相关的生意；若无左右会照，则可能是小生意。'
  },
  {
    key: '9=文昌C',
    palace: '官禄宫',
    star: '文昌',
    hua: 'C',
    interpretation: '官禄宫文昌化科 适合走学术路线，能够有创见并获得声望。'
  },
  {
    key: '9=文曲C',
    palace: '官禄宫',
    star: '文曲',
    hua: 'C',
    interpretation: '官禄宫文曲化科 适合走学术路线，能够有创见并获得声望。'
  },
  {
    key: '9=天机C',
    palace: '官禄宫',
    star: '天机',
    hua: 'C',
    interpretation: '官禄宫天机化科 擅长筹划事业，点子多，适合从事需要脑力的工作，有利于考试和升迁。'
  },
  {
    key: '9=左辅C',
    palace: '官禄宫',
    star: '左辅',
    hua: 'C',
    interpretation: '官禄宫左辅化科 在事业上，能得到很多帮助。'
  },
  {
    key: '9=右弼C',
    palace: '官禄宫',
    star: '右弼',
    hua: 'C',
    interpretation: '官禄宫右弼化科 在事业上，能得到很多帮助。'
  },
  {
    key: '9=天梁C',
    palace: '官禄宫',
    star: '天梁',
    hua: 'C',
    interpretation: '官禄宫天梁化科 主声誉良好，但不主实权，适合从事文职工作。'
  },
  {
    key: '9=太阴C',
    palace: '官禄宫',
    star: '太阴',
    hua: 'C',
    interpretation: '官禄宫太阴化科 擅长理财。若失去光辉，虽能理财但缺乏兴趣。伴侣可能会藏私房钱。'
  },
  {
    key: '9=太阳D',
    palace: '官禄宫',
    star: '太阳',
    hua: 'D',
    interpretation: '官禄宫太阳化忌 主工作中波折较多，尤其男性命主创业时可能不顺。男性同事或上司可能对其刁难，尽管工作计划周详，仍可能出现变故。'
  },
  {
    key: '9=太阴D',
    palace: '官禄宫',
    star: '太阴',
    hua: 'D',
    interpretation: '官禄宫太阴化忌 无论男女，切忌经营不动产。事业中可能遭遇小人的暗害，或女性的阻碍。'
  },
  {
    key: '9=廉贞D',
    palace: '官禄宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '官禄宫廉贞化忌 主工作中多有行政上的是非，可能面临违规罚款的问题。倾向于投机，但运势不佳。'
  },
  {
    key: '9=巨门D',
    palace: '官禄宫',
    star: '巨门',
    hua: 'D',
    interpretation: '官禄宫巨门化忌 工作中容易出现口舌之争，需注意因工作引起的官司或刑讼。'
  },
  {
    key: '9=天机D',
    palace: '官禄宫',
    star: '天机',
    hua: 'D',
    interpretation: '官禄宫天机化忌 计划和策划不当，可能导致失败。不宜从事机械行业，可能遭遇破产。喜欢思考和变动，但若判断失误，则难以避免失败。'
  },
  {
    key: '9=文曲D',
    palace: '官禄宫',
    star: '文曲',
    hua: 'D',
    interpretation: '官禄宫文曲化忌 辛劳却难以成就，可能白费心机，且工作中常与同事关系不和谐。'
  },
  {
    key: '9=天同D',
    palace: '官禄宫',
    star: '天同',
    hua: 'D',
    interpretation: '官禄宫天同化忌 主无贵人相助，计划不周全，社交能力差，自身辛苦劳碌，发展空间有限。'
  },
  {
    key: '9=文昌D',
    palace: '官禄宫',
    star: '文昌',
    hua: 'D',
    interpretation: '官禄宫文昌化忌 特别注意文书问题，可能遭遇伪造文书或有价证券的情况，需提防被他人嫁祸。'
  },
  {
    key: '9=武曲D',
    palace: '官禄宫',
    star: '武曲',
    hua: 'D',
    interpretation: '官禄宫武曲化忌 与事业相关的款项可能引发麻烦，如公款亏空。'
  },
  {
    key: '9=贪狼D',
    palace: '官禄宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '官禄宫贪狼化忌 事业中可能涉及桃色纠纷，适合从事与娱乐相关的工作。作为官员需避免贪污，以免引发官司；在民营企业中，可能会遇到桃色问题。'
  },

  // 田宅宫生年四化解释（39条）
  {
    key: '10=廉贞A',
    palace: '田宅宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '田宅宫廉贞化禄 主家中平安，财富状况良好，且有桃花运，伴侣可能比自己年长。家庭富裕，家电设备齐全，室内摆设和装潢讲究。需注意保护祖业，避免破败。'
  },
  {
    key: '10=天机A',
    palace: '田宅宫',
    star: '天机',
    hua: 'A',
    interpretation: '田宅宫天机化禄 家宅越是变动，状况越好，主有计划性的变迁。家附近有寺庙或教会。'
  },
  {
    key: '10=天同A',
    palace: '田宅宫',
    star: '天同',
    hua: 'A',
    interpretation: '田宅宫天同化禄 主有华丽的住宅，喜欢将其布置得美观舒适，享受在家中的生活。适合从事房地产买卖，能带来财富。'
  },
  {
    key: '10=太阴A',
    palace: '田宅宫',
    star: '太阴',
    hua: 'A',
    interpretation: '田宅宫太阴化禄 太阴为田宅主，通常会有许多不动产，尤其当太阴旺守宫位或与太阳同宫时，家产难以计数。家中保持整洁，适合经营不动产，能赚取丰厚利润。'
  },
  {
    key: '10=贪狼A',
    palace: '田宅宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '田宅宫贪狼化禄 主财运不错，有产业，桃花运旺盛，但寿命方面需多加注意。'
  },
  {
    key: '10=武曲A',
    palace: '田宅宫',
    star: '武曲',
    hua: 'A',
    interpretation: '田宅宫武曲化禄 武曲主财，化禄入田宅，财运稳定，擅长赚钱，人生富裕。'
  },
  {
    key: '10=太阳A',
    palace: '田宅宫',
    star: '太阳',
    hua: 'A',
    interpretation: '田宅宫太阳化禄 可担任无实权的老板，参与合伙生意。男性命主通常先成家后立业，赚钱后优先购房。若与太阴同宫，家产丰厚，需注意保护祖业，赚钱后可参与公益事业。'
  },
  {
    key: '10=巨门A',
    palace: '田宅宫',
    star: '巨门',
    hua: 'A',
    interpretation: '田宅宫巨门化禄 家中常备酒食，喜欢与朋友聚会，畅谈交流。家运良好，不断置业，但可能存在意见分歧。'
  },
  {
    key: '10=天梁A',
    palace: '田宅宫',
    star: '天梁',
    hua: 'A',
    interpretation: '田宅宫天梁化禄 主荫庇而非财运，能解厄，身体健康，家中平安。田宅宫有"屋荫"，意味着有安全的居所，受祖荫庇护。'
  },
  {
    key: '10=破军A',
    palace: '田宅宫',
    star: '破军',
    hua: 'A',
    interpretation: '田宅宫破军化禄 因照子女宫，破军主子女，子女与家庭关系良好，并对家庭有助力。本人桃花运旺盛，伴侣可能为年长者。祖产经历过破败后又重建。'
  },
  {
    key: '10=破军B',
    palace: '田宅宫',
    star: '破军',
    hua: 'B',
    interpretation: '田宅宫破军化权 主家中常有修整。'
  },
  {
    key: '10=天梁B',
    palace: '田宅宫',
    star: '天梁',
    hua: 'B',
    interpretation: '田宅宫天梁化权 主家附近有大树或家中有大型木器，家中掌权者较为明显。'
  },
  {
    key: '10=天机B',
    palace: '田宅宫',
    star: '天机',
    hua: 'B',
    interpretation: '田宅宫天机化权 家中摆设常有变动，或频繁迁居。'
  },
  {
    key: '10=天同B',
    palace: '田宅宫',
    star: '天同',
    hua: 'B',
    interpretation: '田宅宫天同化权 喜欢在家中享受舒适的生活。'
  },
  {
    key: '10=太阴B',
    palace: '田宅宫',
    star: '太阴',
    hua: 'B',
    interpretation: '田宅宫太阴化权 家中女性掌权，男性命主可能喜欢依赖母亲或妻子。'
  },
  {
    key: '10=贪狼B',
    palace: '田宅宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '田宅宫贪狼化权 主迁动、享福，桃花运旺盛。'
  },
  {
    key: '10=武曲B',
    palace: '田宅宫',
    star: '武曲',
    hua: 'B',
    interpretation: '田宅宫武曲化权 家中多大型金属物品。'
  },
  {
    key: '10=太阳B',
    palace: '田宅宫',
    star: '太阳',
    hua: 'B',
    interpretation: '田宅宫太阳化权 女命主在家中掌权，常与伴侣有权力上的争执，主创业。'
  },
  {
    key: '10=紫微B',
    palace: '田宅宫',
    star: '紫微',
    hua: 'B',
    interpretation: '田宅宫紫微化权 家中陈设高贵大方。'
  },
  {
    key: '10=巨门B',
    palace: '田宅宫',
    star: '巨门',
    hua: 'B',
    interpretation: '田宅宫巨门化权 家中常有争辩。'
  },
  {
    key: '10=紫微C',
    palace: '田宅宫',
    star: '紫微',
    hua: 'C',
    interpretation: '田宅宫紫微化科 家庭布置高贵。'
  },
  {
    key: '10=太阴C',
    palace: '田宅宫',
    star: '太阴',
    hua: 'C',
    interpretation: '田宅宫太阴化科 喜欢微弱的灯光，注重采光和情调。可能会暗中借用他人名义购房。'
  },
  {
    key: '10=文昌C',
    palace: '田宅宫',
    star: '文昌',
    hua: 'C',
    interpretation: '田宅宫文昌化科 可能分期付款购房，涉及名义变更，如建造者非本人，付款后才过户。居住附近有学校。'
  },
  {
    key: '10=文曲C',
    palace: '田宅宫',
    star: '文曲',
    hua: 'C',
    interpretation: '田宅宫文曲化科 可能分期付款购房，涉及名义变更，如建造者非本人，付款后才过户。居住附近有学校。'
  },
  {
    key: '10=武曲C',
    palace: '田宅宫',
    star: '武曲',
    hua: 'C',
    interpretation: '田宅宫武曲化科 主家世清白，家居布置雅致且富有情调。'
  },
  {
    key: '10=天机C',
    palace: '田宅宫',
    star: '天机',
    hua: 'C',
    interpretation: '田宅宫天机化科 主家世清白，家居布置雅致且富有情调，喜欢养花。'
  },
  {
    key: '10=天梁C',
    palace: '田宅宫',
    star: '天梁',
    hua: 'C',
    interpretation: '田宅宫天梁化科 主家世清白，家居布置雅致且富有情调。'
  },
  {
    key: '10=右弼C',
    palace: '田宅宫',
    star: '右弼',
    hua: 'C',
    interpretation: '田宅宫右弼化科 主家世清白，家居布置雅致且富有情调。'
  },
  {
    key: '10=左辅C',
    palace: '田宅宫',
    star: '左辅',
    hua: 'C',
    interpretation: '田宅宫左辅化科 主家世清白，家居布置雅致且富有情调。'
  },
  {
    key: '10=太阳D',
    palace: '田宅宫',
    star: '太阳',
    hua: 'D',
    interpretation: '田宅宫太阳化忌 主住宅光线不足，男性可能面临健康问题。曾有案例：太阳化忌在亥坐田宅，家产虽丰厚，但为人节俭，甚至因小额税金未缴而遭遇困境。'
  },
  {
    key: '10=太阴D',
    palace: '田宅宫',
    star: '太阴',
    hua: 'D',
    interpretation: '田宅宫太阴化忌 主住宅光线不足，家中女性可能面临较多困难或容易唠叨。'
  },
  {
    key: '10=廉贞D',
    palace: '田宅宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '田宅宫廉贞化忌 主家中是非较多，可能涉及行政官司。购房过户、产权书等可能存在问题。'
  },
  {
    key: '10=巨门D',
    palace: '田宅宫',
    star: '巨门',
    hua: 'D',
    interpretation: '田宅宫巨门化忌 家中常有争吵和口舌是非，个人可能面临法律问题。'
  },
  {
    key: '10=天机D',
    palace: '田宅宫',
    star: '天机',
    hua: 'D',
    interpretation: '田宅宫天机化忌 主常常迁动住居，家中大小事务常常令人烦恼。天机表征平辈亲属，可能常有麻烦。'
  },
  {
    key: '10=文昌D',
    palace: '田宅宫',
    star: '文昌',
    hua: 'D',
    interpretation: '田宅宫文昌化忌 注意房地产所有权及相关凭证，易生问题。切忌为他人担保。家中可能有许多书籍，但无人阅读，或大家争着看，导致过犹不及的现象。'
  },
  {
    key: '10=文曲D',
    palace: '田宅宫',
    star: '文曲',
    hua: 'D',
    interpretation: '田宅宫文曲化忌 注意房地产所有权及相关凭证，易生问题。切忌为他人担保。家中可能有许多书籍，但无人阅读，或大家争着看，导致过犹不及的现象。'
  },
  {
    key: '10=天同D',
    palace: '田宅宫',
    star: '天同',
    hua: 'D',
    interpretation: '田宅宫天同化忌 家中不安宁，操心琐事。可能家中供水设备出现问题，如水龙头损坏、水管破裂等。'
  },
  {
    key: '10=武曲D',
    palace: '田宅宫',
    star: '武曲',
    hua: 'D',
    interpretation: '田宅宫武曲化忌 家中易因财务问题产生争执，或因金钱事故引发法律问题。需小心金属器具，避免意外伤害。'
  },
  {
    key: '10=贪狼D',
    palace: '田宅宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '田宅宫贪狼化忌 主桃花纠纷较多。在田宅方面，可能一生桃花运旺盛；若涉及大限田宅，可能影响十年。'
  },

  // 福德宫生年四化解释（39条）
  {
    key: '11=廉贞A',
    palace: '福德宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '福德宫廉贞化禄 主享受与桃花运，主观意识强。虽然经济条件不错，但也会感到忙碌和烦恼。不过能够自我安慰和开解。'
  },
  {
    key: '11=天机A',
    palace: '福德宫',
    star: '天机',
    hua: 'A',
    interpretation: '福德宫天机化禄 对人生哲理有独特见解，喜欢有计划的生活，热爱宗教、哲学、玄佛学和阴阳学。'
  },
  {
    key: '11=天同A',
    palace: '福德宫',
    star: '天同',
    hua: 'A',
    interpretation: '福德宫天同化禄 主享受。天同化禄入福德是最吉利的，能逢凶化吉，有解厄的能力，主长寿与福气。'
  },
  {
    key: '11=太阴A',
    palace: '福德宫',
    star: '太阴',
    hua: 'A',
    interpretation: '福德宫太阴化禄 若太阴失辉，亦主桃花。太阴化禄在福德照财帛，主财富。女性命主有老板格，但无实权，能享受福气，但可能感到孤寂。'
  },
  {
    key: '11=贪狼A',
    palace: '福德宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '福德宫贪狼化禄 主桃花运强烈，性需求旺盛，能解厄，主长寿，享受高品质生活，喜爱香水和化妆品的气味。'
  },
  {
    key: '11=武曲A',
    palace: '福德宫',
    star: '武曲',
    hua: 'A',
    interpretation: '福德宫武曲化禄 主享受无缺，重视物质享受。'
  },
  {
    key: '11=太阳A',
    palace: '福德宫',
    star: '太阳',
    hua: 'A',
    interpretation: '福德宫太阳化禄 主心地光明，快乐无忧，活跃好动，能通过活动创造财富。男性命主有老板气质，但无实权。'
  },
  {
    key: '11=巨门A',
    palace: '福德宫',
    star: '巨门',
    hua: 'A',
    interpretation: '福德宫巨门化禄 主一生口福不错，能通过口才获得财富。'
  },
  {
    key: '11=天梁A',
    palace: '福德宫',
    star: '天梁',
    hua: 'A',
    interpretation: '福德宫天梁化禄 主受荫、长寿，遇到困难能得到解救，身体健康，重视精神生活，家庭和睦。'
  },
  {
    key: '11=破军A',
    palace: '福德宫',
    star: '破军',
    hua: 'A',
    interpretation: '福德宫破军化禄 主喜欢享受，花钱不计较，凡事积极参与，善于决策，是优秀的参谋。'
  },
  {
    key: '11=破军B',
    palace: '福德宫',
    star: '破军',
    hua: 'B',
    interpretation: '福德宫破军化权 主享受，常有大手笔的支出。'
  },
  {
    key: '11=天梁B',
    palace: '福德宫',
    star: '天梁',
    hua: 'B',
    interpretation: '福德宫天梁化权 喜欢受到他人的赞美，也热爱文艺活动。'
  },
  {
    key: '11=天机B',
    palace: '福德宫',
    star: '天机',
    hua: 'B',
    interpretation: '福德宫天机化权 主心思多变，兴趣广泛，喜欢享受生活，常涉猎宗教、哲学和阴阳学。'
  },
  {
    key: '11=天同B',
    palace: '福德宫',
    star: '天同',
    hua: 'B',
    interpretation: '福德宫天同化权 主福气大，长寿。'
  },
  {
    key: '11=太阴B',
    palace: '福德宫',
    star: '太阴',
    hua: 'B',
    interpretation: '福德宫太阴化权 主有桃花，但需有节制。若太阴失辉，影响更明显。'
  },
  {
    key: '11=贪狼B',
    palace: '福德宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '福德宫贪狼化权 主享受酒色，也可能有赌博倾向。'
  },
  {
    key: '11=武曲B',
    palace: '福德宫',
    star: '武曲',
    hua: 'B',
    interpretation: '福德宫武曲化权 主喜欢掌控财务，享受金钱带来的快感。'
  },
  {
    key: '11=太阳B',
    palace: '福德宫',
    star: '太阳',
    hua: 'B',
    interpretation: '福德宫太阳化权 人际交往良好，若失辉则可能感到不如意。'
  },
  {
    key: '11=紫微B',
    palace: '福德宫',
    star: '紫微',
    hua: 'B',
    interpretation: '福德宫紫微化权 喜欢清高的生活。'
  },
  {
    key: '11=巨门B',
    palace: '福德宫',
    star: '巨门',
    hua: 'B',
    interpretation: '福德宫巨门化权 内心常有矛盾，容易自我争辩。父母宫聪明，亲子关系可商量，偶尔会有争执。'
  },
  {
    key: '11=紫微C',
    palace: '福德宫',
    star: '紫微',
    hua: 'C',
    interpretation: '福德宫紫微化科 有解厄的能力。'
  },
  {
    key: '11=天机C',
    palace: '福德宫',
    star: '天机',
    hua: 'C',
    interpretation: '福德宫天机化科 思想灵活，喜欢变通，热衷于哲学和阴阳学。'
  },
  {
    key: '11=太阴C',
    palace: '福德宫',
    star: '太阴',
    hua: 'C',
    interpretation: '福德宫太阴化科 若太阴失辉，主桃花运。'
  },
  {
    key: '11=天梁C',
    palace: '福德宫',
    star: '天梁',
    hua: 'C',
    interpretation: '福德宫天梁化科 多有长辈的照顾，与年长者有缘。父母聪明好学，深受父母的疼爱与教导，父母性格温和。'
  },
  {
    key: '11=文曲C',
    palace: '福德宫',
    star: '文曲',
    hua: 'C',
    interpretation: '福德宫文曲化科 心神安定，享受生活有节制。'
  },
  {
    key: '11=左辅C',
    palace: '福德宫',
    star: '左辅',
    hua: 'C',
    interpretation: '福德宫左辅化科 心神安定，享受生活有节制。'
  },
  {
    key: '11=右弼C',
    palace: '福德宫',
    star: '右弼',
    hua: 'C',
    interpretation: '福德宫右弼化科 心神安定，享受生活有节制。'
  },
  {
    key: '11=文昌C',
    palace: '福德宫',
    star: '文昌',
    hua: 'C',
    interpretation: '福德宫文昌化科 心神安定，享受生活有节制。'
  },
  {
    key: '11=武曲C',
    palace: '福德宫',
    star: '武曲',
    hua: 'C',
    interpretation: '福德宫武曲化科 心神安定，享受生活有节制。'
  },
  {
    key: '11=太阳D',
    palace: '福德宫',
    star: '太阳',
    hua: 'D',
    interpretation: '福德宫太阳化忌 一般情况下，出生时可能未见祖父。太阳主个性，化忌则可能容易自我生气。'
  },
  {
    key: '11=太阴D',
    palace: '福德宫',
    star: '太阴',
    hua: 'D',
    interpretation: '福德宫太阴化忌 主内心苦闷，可能会感到无名的气恼。出生时，可能未见祖母，可能会遭遇一些暗中的损失。'
  },
  {
    key: '11=廉贞D',
    palace: '福德宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '福德宫廉贞化忌 主可能面临意外之灾，如交通事故或受伤。内心常感烦躁，容易情绪波动。'
  },
  {
    key: '11=巨门D',
    palace: '福德宫',
    star: '巨门',
    hua: 'D',
    interpretation: '福德宫巨门化忌 主口福较差，常为是非烦恼。'
  },
  {
    key: '11=天机D',
    palace: '福德宫',
    star: '天机',
    hua: 'D',
    interpretation: '福德宫天机化忌 内心纠结，思绪混乱，容易自我困扰。建议信仰宗教或研究命理学以获得心灵的平静。'
  },
  {
    key: '11=文昌D',
    palace: '福德宫',
    star: '文昌',
    hua: 'D',
    interpretation: '福德宫文昌化忌 主精神烦扰，神经紧张，可能做事情时感到不顺，容易出现过激行为。'
  },
  {
    key: '11=文曲D',
    palace: '福德宫',
    star: '文曲',
    hua: 'D',
    interpretation: '福德宫文曲化忌 主精神烦扰，神经紧张，可能做事情时感到不顺，容易出现过激行为。'
  },
  {
    key: '11=天同D',
    palace: '福德宫',
    star: '天同',
    hua: 'D',
    interpretation: '福德宫天同化忌 天同为福星，但化忌时可能无法享受福气，且身体状况不佳，难以化解困难。'
  },
  {
    key: '11=武曲D',
    palace: '福德宫',
    star: '武曲',
    hua: 'D',
    interpretation: '福德宫武曲化忌 主内心郁闷，感到如同胸口压着重石。'
  },
  {
    key: '11=贪狼D',
    palace: '福德宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '福德宫贪狼化忌 表面平静，内心却感到空虚，常有不切实际的幻想，可能面临健康问题和寿命短暂的风险。'
  },

  // 父母宫生年四化解释（39条）
  {
    key: '12=廉贞A',
    palace: '父母宫',
    star: '廉贞',
    hua: 'A',
    interpretation: '父母宫廉贞化禄 主与长辈关系良好，尤其与异性长辈的缘分更深。'
  },
  {
    key: '12=天机A',
    palace: '父母宫',
    star: '天机',
    hua: 'A',
    interpretation: '父母宫天机化禄 主与长辈关系密切，且长辈智慧高、思维灵活。通常男性长辈对自己影响较小。'
  },
  {
    key: '12=天同A',
    palace: '父母宫',
    star: '天同',
    hua: 'A',
    interpretation: '父母宫天同化禄 主父母的照顾，父母长寿且感情良好。'
  },
  {
    key: '12=太阴A',
    palace: '父母宫',
    star: '太阴',
    hua: 'A',
    interpretation: '父母宫太阴化禄 主与父母之间的缘分较深，可能参与公共文化事业。'
  },
  {
    key: '12=贪狼A',
    palace: '父母宫',
    star: '贪狼',
    hua: 'A',
    interpretation: '父母宫贪狼化禄 主父母寿命较长，自己聪明且重视享受生活。'
  },
  {
    key: '12=武曲A',
    palace: '父母宫',
    star: '武曲',
    hua: 'A',
    interpretation: '父母宫武曲化禄 主与父母关系良好，父母性格较为刚强，擅长赚钱。虽然有些刑克，离开后可减轻影响。'
  },
  {
    key: '12=太阳A',
    palace: '父母宫',
    star: '太阳',
    hua: 'A',
    interpretation: '父母宫太阳化禄 主与父亲的缘分较深。即使自己是老板，可能也没有实权，主要从事文书或洽谈工作，适合公家机构。'
  },
  {
    key: '12=巨门A',
    palace: '父母宫',
    star: '巨门',
    hua: 'A',
    interpretation: '父母宫巨门化禄 与父母特别是母亲沟通良好，且自己口才不错，口福也佳。'
  },
  {
    key: '12=天梁A',
    palace: '父母宫',
    star: '天梁',
    hua: 'A',
    interpretation: '父母宫天梁化禄 受父母之荫较深，有可能继承遗产。'
  },
  {
    key: '12=破军A',
    palace: '父母宫',
    star: '破军',
    hua: 'A',
    interpretation: '父母宫破军化禄 主父母可能有较大的开支。年轻时可能会离家创业。'
  },
  {
    key: '12=破军B',
    palace: '父母宫',
    star: '破军',
    hua: 'B',
    interpretation: '父母宫破军化权 注意文书上的繁杂事务。父母在幼年时期在精神和财力上投入较多。'
  },
  {
    key: '12=天梁B',
    palace: '父母宫',
    star: '天梁',
    hua: 'B',
    interpretation: '父母宫天梁化权 父母有威权，你对他们非常孝敬，虽然有时难以达成共识，但仍然顺从并愿意学习。'
  },
  {
    key: '12=天机B',
    palace: '父母宫',
    star: '天机',
    hua: 'B',
    interpretation: '父母宫天机化权 主聪明机智。'
  },
  {
    key: '12=天同B',
    palace: '父母宫',
    star: '天同',
    hua: 'B',
    interpretation: '父母宫天同化权 主父母有福寿，自己也有进退的智慧。'
  },
  {
    key: '12=太阴B',
    palace: '父母宫',
    star: '太阴',
    hua: 'B',
    interpretation: '父母宫太阴化权 家中母亲掌权，能力突出，性格较强，操心事务较多。'
  },
  {
    key: '12=贪狼B',
    palace: '父母宫',
    star: '贪狼',
    hua: 'B',
    interpretation: '父母宫贪狼化权 主聪明，但需注意意外伤害的风险。'
  },
  {
    key: '12=武曲B',
    palace: '父母宫',
    star: '武曲',
    hua: 'B',
    interpretation: '父母宫武曲化权 需特别注意金属物品带来的伤害，女性命主要留意流产的可能性。'
  },
  {
    key: '12=太阳B',
    palace: '父母宫',
    star: '太阳',
    hua: 'B',
    interpretation: '父母宫太阳化权 男性命主可能面临妻子在家中掌权的情况，父母宫与夫妻关系密切。'
  },
  {
    key: '12=紫微B',
    palace: '父母宫',
    star: '紫微',
    hua: 'B',
    interpretation: '父母宫紫微化权 主父母背景高贵，但自己在创业方面可能力量不足，需防小人。'
  },
  {
    key: '12=巨门B',
    palace: '父母宫',
    star: '巨门',
    hua: 'B',
    interpretation: '父母宫巨门化权 父母之间可能有争斗，自己容易被牵扯其中。'
  },
  {
    key: '12=紫微C',
    palace: '父母宫',
    star: '紫微',
    hua: 'C',
    interpretation: '父母宫紫微化科 父母很可能是公职人员。'
  },
  {
    key: '12=天机C',
    palace: '父母宫',
    star: '天机',
    hua: 'C',
    interpretation: '父母宫天机化科 主自己机智灵活。天机主要与兄弟相关，不直接主父母。'
  },
  {
    key: '12=武曲C',
    palace: '父母宫',
    star: '武曲',
    hua: 'C',
    interpretation: '父母宫武曲化科 为人聪明好学，受到父母的疼爱和教导，父母性格温和。'
  },
  {
    key: '12=文昌C',
    palace: '父母宫',
    star: '文昌',
    hua: 'C',
    interpretation: '父母宫文昌化科 为人聪明好学，受到父母的疼爱和教导，父母性格温和，有利于功名。'
  },
  {
    key: '12=右弼C',
    palace: '父母宫',
    star: '右弼',
    hua: 'C',
    interpretation: '父母宫右弼化科 为人聪明好学，受到父母的疼爱和教导，父母性格温和。'
  },
  {
    key: '12=天梁C',
    palace: '父母宫',
    star: '天梁',
    hua: 'C',
    interpretation: '父母宫天梁化科 为人聪明好学，受到父母的疼爱和教导，父母性格温和。'
  },
  {
    key: '12=文曲C',
    palace: '父母宫',
    star: '文曲',
    hua: 'C',
    interpretation: '父母宫文曲化科 为人聪明好学，受到父母的疼爱和教导，父母性格温和。'
  },
  {
    key: '12=左辅C',
    palace: '父母宫',
    star: '左辅',
    hua: 'C',
    interpretation: '父母宫左辅化科 为人聪明好学，受到父母的疼爱和教导，父母性格温和。'
  },
  {
    key: '12=太阴C',
    palace: '父母宫',
    star: '太阴',
    hua: 'C',
    interpretation: '父母宫太阴化科 为人聪明好学，受到父母的疼爱和教导，父母性格温和。'
  },
  {
    key: '12=太阳D',
    palace: '父母宫',
    star: '太阳',
    hua: 'D',
    interpretation: '父母宫太阳化忌 可能对父亲有损害，若无损害，男性命主则可能影响自己。主眼睛健康状况不佳，尤其是左眼。'
  },
  {
    key: '12=太阴D',
    palace: '父母宫',
    star: '太阴',
    hua: 'D',
    interpretation: '父母宫太阴化忌 可能对母亲有损害，若无损害，女性命主则可能影响自己。主眼睛健康状况不佳，尤其是右眼。'
  },
  {
    key: '12=廉贞D',
    palace: '父母宫',
    star: '廉贞',
    hua: 'D',
    interpretation: '父母宫廉贞化忌 主父母脾气较急，其中一方可能性格较为风流。主自己在行政方面可能遭遇是非。'
  },
  {
    key: '12=巨门D',
    palace: '父母宫',
    star: '巨门',
    hua: 'D',
    interpretation: '父母宫巨门化忌 主与母亲之间可能存在代沟，自己可能会有一些疑难杂症。'
  },
  {
    key: '12=天机D',
    palace: '父母宫',
    star: '天机',
    hua: 'D',
    interpretation: '父母宫天机化忌 与父亲沟通不畅，需注意交通安全。'
  },
  {
    key: '12=文昌D',
    palace: '父母宫',
    star: '文昌',
    hua: 'D',
    interpretation: '父母宫文昌化忌 主自己容易惹上文书方面的麻烦。'
  },
  {
    key: '12=文曲D',
    palace: '父母宫',
    star: '文曲',
    hua: 'D',
    interpretation: '父母宫文曲化忌 主自己容易惹上文书方面的麻烦。'
  },
  {
    key: '12=天同D',
    palace: '父母宫',
    star: '天同',
    hua: 'D',
    interpretation: '父母宫天同化忌 主父母可能无法享受福气，身体状况也不佳。'
  },
  {
    key: '12=武曲D',
    palace: '父母宫',
    star: '武曲',
    hua: 'D',
    interpretation: '父母宫武曲化忌 主父母性格较为刚强，财产较少。'
  },
  {
    key: '12=贪狼D',
    palace: '父母宫',
    star: '贪狼',
    hua: 'D',
    interpretation: '父母宫贪狼化忌 主父母可能风流且爱幻想，自己容易遭遇一些杂症。'
  }
];

// 根据宫位编号、星名和化星类型查找解释
export function getSihuaInterpretation(palaceNumber: number, starName: string, hua: string): string | null {
  const key = `${palaceNumber}=${starName}${hua}`;
  const interpretation = SIHUA_INTERPRETATIONS_COMPLETE.find(item => item.key === key);
  return interpretation ? interpretation.interpretation : null;
}

// 根据宫位名称获取该宫位的所有四化解释
export function getSihuaInterpretationsByPalace(palaceName: string): SihuaInterpretation[] {
  return SIHUA_INTERPRETATIONS_COMPLETE.filter(item => item.palace === palaceName);
} 