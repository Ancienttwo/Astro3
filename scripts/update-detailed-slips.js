// 更新详细签文数据
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDetailedSlips() {
  console.log('🚀 更新详细签文数据...\n');

  try {
    // 获取关帝庙记录
    const { data: temples } = await supabase
      .from('temple_systems')
      .select('*')
      .eq('temple_code', 'guandi')
      .single();

    if (!temples) {
      throw new Error('未找到关帝庙记录');
    }

    console.log('✅ 找到关帝庙记录:', temples.id);

    // 详细签文数据
    const detailedSlips = [
      // 第二签 - 用户提供的详细版本
      {
        slip_number: 2,
        title: '第二籤 張子房遊赤松 甲乙 上吉',
        content: '盈虛消息總天時\n自此君當百事宜\n若問前程歸縮地\n更須方寸好修為',
        basic_interpretation: `此籤上吉。盈滿虛空，生滅盛衰，乃是天時的循環，一個人處世，如果能夠順天時，自然樣樣好。如果想前途無阻礙，一路風順，須要心地好好修為向善才行。

曾经遇到不顺遂的过去，到现在也该是转运的时候了，之后会渐入佳境，但不可因此而骄纵。如能从心做起，随时随地都能发出善的念头，积累福荫，必会有美好的未来。此签的重点在于心里的想法，如能以善念出发，必能排除万难达成目标，但如有偏斜的歹念，则会为自己招来厄运，不可不慎。

問婚姻，表示有成功的希望。如果問訴訟，則和解為宜。問疾病，則宜多禱告神明保佑。應考功名，有希望，但不可心躁。求財平平，做事業宜按步就班，不可好高騖遠，才不致失敗。總之，不妄動，再正心修德，自然安泰。`,
        categories: ['修身', '前程', '時運', '德行', '婚姻', '訴訟', '疾病', '功名', '求財', '事業'],
        fortune_level: 'excellent',
        historical_context: `子房名良。韓國人。自博浪沙事後（指行弒秦始皇）匿下邳。遊圮上遇衣褐老夫。墮履命良取跪進之。老夫曰。孺子可教。越五日授以太公兵法。謂後十三年。濟北穀城山下。黃石即我也。後良佐（漢）高祖定天下。封留侯。因感鳥盡弓藏。謝病歸入白雲山。師事黃石號赤松子。

從前有一少年患病，占得此籤，不久即去逝，正應在「前程歸縮地」一句。又有一人問行人，占得此籤，不數日其人兼程而至，亦應了「縮地」之句。`,
        symbolism: '盈虛消息指事物的盈滿虛空循環變化，天時代表自然時序規律。前程歸縮地意為前路需要收斂謹慎，方寸好修為強調內心品德修養的重要性。縮地典故來自仙人能縮地成寸的神通，寓意時空變化莫測。'
      },

      // 第三签 - 用户提供的详细版本
      {
        slip_number: 3,
        title: '第三籤 賈誼遇漢文帝 甲丙 中吉',
        content: '衣食自然生處有\n勸君不用苦勞心\n但能孝悌存忠信\n福祿來成禍不侵',
        basic_interpretation: `此籤中吉。此签只宜守旧，不可贪求，但存中直，却得两平。须以孝悌忠信为本，自有福禄来成之应，若思强取强求，反招意外之祸，占者循理守分则吉。

一個人在世，只要照本份去做，衣食自然不用愁。俗云：「命裡有時終須有，命裡無時莫強求。」強求富貴，徒勞心力，反致傷憂。如果在家事親至孝，兄弟友愛，在外待人忠信自然內外無怨，禍患不侵。

正是：「富貴前定，何須強求，動合循理，天必佑之。隨緣安份，直道而行，心中無愧，自然和平。」

抽得此籤，表示只宜守舊，不可貪求。心中存著正直，自然無憂。問謀事，雖有成功的希望，但時間上恐久延。談婚姻，在時間上也是比較遲延。問訴訟，則以和解為宜。問疾病，目前還無法痊癒，尚須待一段時間。`,
        categories: ['守分', '孝悌', '忠信', '安分', '謀事', '婚姻', '訴訟', '疾病', '隨緣', '修德'],
        fortune_level: 'good',
        historical_context: `貾谊遇汉文帝：汉·贾谊，洛阳人。文帝时河南守吴荐之，后为博士。年二十余超迁，岁中至大中大夫。请改正朔，兴礼乐，上《治安策》。绛、灌等毁之，出为长沙王太傅。谊既谪去，渡湘水作赋，吊屈原。论者谓：贾生，王佐才，遇汉文明主，终不大用，卒悲伤而死，岂非天(意)乎？

张公艺九世同居：张公艺，台前县孙口乡桥北张人，生于公元578年，卒于公元676年，历北齐、北周、隋、唐四代，寿九十九岁。公艺自幼有成德之望，正德修身，礼让齐家，立义和广堂。制典则，设条教以戒子侄，是以父慈子孝，兄友弟和，夫正妇顺，姑婉媳听，九代同居，合家九百人。

道光年间有一人，自恃有钱，想有钱捐得官爵，到庙抽得此签。人家劝他做富家翁，不必妄想做官，他不听，后来花了好多钱，仍无法实现企图，一气死在旅途上，正应了这首签诗的前二句。`,
        symbolism: '衣食自然有指基本生活需求天然具足，不用苦勞心代表無需過度憂慮操心。孝悌忠信是做人的根本四德，福祿來成表示自然會有好運降臨，禍不侵意為災禍邪惡不會侵擾正直之人。'
      }
    ];

    // 更新每个签文
    for (const slip of detailedSlips) {
      console.log(`📝 更新第${slip.slip_number}签...`);
      
      const { data, error } = await supabase
        .from('fortune_slips')
        .update({
          title: slip.title,
          content: slip.content,
          basic_interpretation: slip.basic_interpretation,
          categories: slip.categories,
          fortune_level: slip.fortune_level,
          historical_context: slip.historical_context,
          symbolism: slip.symbolism,
          updated_at: new Date().toISOString()
        })
        .eq('temple_system_id', temples.id)
        .eq('slip_number', slip.slip_number)
        .select();

      if (error) {
        console.error(`❌ 更新第${slip.slip_number}签失败:`, error);
      } else {
        console.log(`✅ 成功更新第${slip.slip_number}签`);
        console.log(`   标题: ${slip.title}`);
        console.log(`   内容: ${slip.content.substring(0, 50)}...`);
      }

      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n🎉 详细签文数据更新完成！');
    return true;

  } catch (error) {
    console.error('❌ 更新签文数据时发生错误:', error.message);
    return false;
  }
}

async function main() {
  try {
    const success = await updateDetailedSlips();
    
    if (success) {
      console.log('\n✅ 任务完成');
    } else {
      console.log('\n❌ 任务失败');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error.message);
    process.exit(1);
  }
}

main();