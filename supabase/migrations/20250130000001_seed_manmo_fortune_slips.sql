-- Seed Man Mo Temple (文武庙) Fortune Slips
-- Starting with the first slip as provided by the user

-- Insert Man Mo Temple fortune slips
INSERT INTO public.fortune_slips (
    temple_system_id,
    slip_number,
    title,
    title_en,
    title_ja,
    content,
    content_en,
    content_ja,
    basic_interpretation,
    basic_interpretation_en,
    basic_interpretation_ja,
    categories,
    fortune_level,
    historical_context,
    historical_context_en,
    historical_context_ja,
    symbolism,
    symbolism_en,
    symbolism_ja
) VALUES (
    -- Get Man Mo Temple ID
    (SELECT id FROM public.temple_systems WHERE temple_code = 'manmo'),
    1, -- slip_number
    '第一籤 大吉 漢高祖入關', -- title
    'First Oracle - Very Auspicious - Emperor Gaozu Enters the Pass', -- title_en
    '第一籤 大吉 漢高祖入関', -- title_ja
    -- content (original Chinese text)
    '巍巍獨步向雲間。玉殿千官第一班。
富貴榮華天付汝。福如東海壽如山。

仙機：
功名遂。福祿全。訟得理。病即痊。
桑麻熟。婚姻聯。孕生子。行人還。

功名：吉人天相　勤心用功　勿忘力行　必有大獲
六甲：平時修善　心誠求之　辛勤忍受　喜獲麟兒
求財：辛苦經營　胼手胝足　幸勿欺心　必有大利
婚姻：兩姓合婚　互可攀也　珍惜姻緣　占之大吉
農牧：孜孜耕耘　不分農牧　皆可豐收　天人之作
失物：不慎遺落　並未損害　再過匝月　必回身邊
生意：交春即發　公道交易　駿業宏展　致陶朱富
丁口：吾身修之　人人仰之　人多喜慶　舉家豫順
出行：海陸均行　步步小心　和氣致祥　獲利回梓
疾病：善養吾身　加之積善　神靈庇佑　災厄皆去
官司：無妄之災　橫加於身　天理自有　未必畏懼
時運：大吉之時　時與之也　掌握時運　可大豐收',
    -- content_en (English translation)
    'Majestically walking alone towards the clouds. First among a thousand officials in the jade palace.
Wealth and honor are bestowed by Heaven. Fortune like the Eastern Sea, longevity like the mountains.

Divine Guidance:
Fame achieved. Fortune complete. Legal matters resolved. Illness healed.
Crops ripened. Marriage blessed. Child born. Traveler returns.

Career: Blessed by Heaven, work diligently, practice virtue, great rewards await
Pregnancy: Cultivate goodness, pray sincerely, endure hardships, blessed with a precious child  
Wealth: Through hard work and honest dealings, without deception, great profits will come
Marriage: Two families unite harmoniously, cherish the bond, very auspicious
Agriculture: Diligent cultivation, whether farming or herding, all will prosper through divine blessing
Lost Items: Carelessly dropped but undamaged, will return within a month
Business: Prosperity comes with spring, fair dealings, business expansion, wealth like Tao Zhu
Family: Self-cultivation brings respect, many celebrations, household harmony
Travel: Safe by sea or land, proceed carefully, harmony brings fortune, profitable return
Health: Care for your body, accumulate good deeds, divine protection removes all calamities
Legal: Unexpected troubles may arise, but Heaven''s justice prevails, no need to fear
Fortune: Most auspicious time, seize the opportunity, great harvest awaits',
    -- content_ja (Japanese translation)  
    '威々として独り雲間に向かう。玉殿千官の第一班。
富貴栄華は天が汝に付与す。福は東海の如く寿は山の如し。

仙機：
功名遂げられ。福禄全し。訟理を得。病即座に癒ゆ。
桑麻熟し。婚姻連なる。孕みて子を生む。行人還る。

功名：吉人天に相せらる　勤心用功　力行を忘るること勿れ　必ず大獲あり
六甲：平時善を修め　心誠にこれを求め　辛勤忍受　喜びて麟児を獲ん
求財：辛苦経営　胼手胝足　幸いに心を欺くこと勿れ　必ず大利あり
婚姻：両姓合婚　互いに攀じ可し　姻縁を珍惜せよ　これを占うに大吉
農牧：孜々として耕耘し　農牧を分かたず　皆豊収可なり　天人の作
失物：不慎にて遺落せども　並びに損害せず　再び匝月を過ぎて　必ず身辺に回る
生意：交春即ち発す　公道交易　駿業宏展　陶朱の富に致る
丁口：吾が身これを修めば　人々これを仰ぐ　人多く喜慶　挙家豫順
出行：海陸均しく行き　歩々小心　和気祥を致す　利を獲て梓に回る
疾病：善く吾が身を養い　これに積善を加え　神霊庇佑　災厄皆去る
官司：無妄の災　横に身に加わる　天理自ずから有り　未だ必ずしも畏懼せず
時運：大吉の時　時これと与す　時運を掌握せば　大豊収可なり',
    -- basic_interpretation (for anonymous users)
    '此签为大吉之签，象征着功名成就、福禄双全。如汉高祖入关般，预示着重大的成功和地位的提升。各方面运势都非常顺利，是求名求利的最佳时机。但需要继续努力，不可懈怠。',
    -- basic_interpretation_en
    'This is a highly auspicious oracle, symbolizing achievement and complete fortune. Like Emperor Gaozu entering the pass, it foretells great success and elevated status. All aspects of fortune are very favorable - an excellent time for seeking fame and profit. However, continued effort is required without complacency.',
    -- basic_interpretation_ja
    'これは大吉の籤で、功名成就と福禄双全を象徴しています。漢高祖の入関のように、重大な成功と地位の向上を予示しています。あらゆる面で運勢が非常に順調で、名を求め利を求める最良の時期です。しかし継続的な努力が必要で、怠ってはいけません。',
    -- categories
    ARRAY['功名', '求财', '婚姻', '学业', '事业', '健康', '出行'],
    -- fortune_level
    'excellent',
    -- historical_context
    '漢高祖劉邦入關的故事：秦朝末年，天下大亂，項羽與劉邦約定先入關中者為王。劉邦先入秦關，除苛法，與民約法三章，深得民心。秦王子嬰投降，劉邦因此奠定了日後建立漢朝的基礎。此签以此典故比喻機遇來臨，需要把握時機。',
    -- historical_context_en
    'The story of Emperor Gaozu Liu Bang entering the pass: During the fall of the Qin Dynasty, the world was in chaos. Xiang Yu and Liu Bang agreed that whoever entered the pass first would become king. Liu Bang entered first, abolished harsh laws, and made a three-point agreement with the people, winning their hearts. King Ziying of Qin surrendered, and this laid the foundation for Liu Bang to later establish the Han Dynasty. This oracle uses this historical allusion to represent the arrival of opportunity and the need to seize the moment.',
    -- historical_context_ja
    '漢高祖劉邦入関の故事：秦朝末期、天下大乱の時、項羽と劉邦は先に関中に入った者が王となると約束した。劉邦が先に秦関に入り、苛酷な法を除き、民と約法三章を結んで、深く民心を得た。秦王子嬰が投降し、劉邦はこれにより後に漢朝を建立する基礎を築いた。この籤はこの典故を以て機縁の到来を比喩し、時機を把握する必要があることを示している。',
    -- symbolism
    '「巍巍獨步向雲間」象征超越眾人，走向成功的高峰。「玉殿千官第一班」代表地位崇高，位居要職。「福如東海壽如山」寓意福祿綿長，生命力旺盛。整签寓意通過自身努力和天時相助，能夠獲得巨大成功。',
    -- symbolism_en
    '"Walking majestically alone towards the clouds" symbolizes surpassing others and reaching the peak of success. "First among a thousand officials in the jade palace" represents high status and important position. "Fortune like the Eastern Sea, longevity like mountains" implies lasting prosperity and abundant vitality. The entire oracle signifies that through personal effort and favorable timing, great success can be achieved.',
    -- symbolism_ja
    '「巍々として独り雲間に向かう」は衆人を超越し、成功の高峰に向かうことを象徴する。「玉殿千官の第一班」は地位が崇高で、要職に居ることを表す。「福は東海の如く寿は山の如し」は福禄が綿々と続き、生命力が旺盛であることを寓意する。全体の籤は自身の努力と天時の助けにより、巨大な成功を獲得できることを寓意している。'
);

-- Add some placeholder slips for testing (we can add more real content later)
INSERT INTO public.fortune_slips (
    temple_system_id,
    slip_number,
    title,
    title_en,
    title_ja,
    content,
    content_en,
    content_ja,
    basic_interpretation,
    basic_interpretation_en,
    basic_interpretation_ja,
    categories,
    fortune_level
) VALUES 
-- Slip 2 placeholder
(
    (SELECT id FROM public.temple_systems WHERE temple_code = 'manmo'),
    2,
    '第二籤 中吉',
    'Second Oracle - Moderately Auspicious',
    '第二籤 中吉',
    '占位内容 - 第二签文的完整内容将后续添加',
    'Placeholder content - Full content of the second oracle will be added later',
    'プレースホルダー内容 - 第二籤の完全な内容は後で追加されます',
    '此签为中吉，预示着中等程度的好运。',
    'This is a moderately auspicious oracle, indicating moderate good fortune.',
    'これは中吉の籤で、中程度の好運を予示しています。',
    ARRAY['功名', '求财'],
    'good'
),
-- Slip 3 placeholder  
(
    (SELECT id FROM public.temple_systems WHERE temple_code = 'manmo'),
    3,
    '第三籤 平吉',
    'Third Oracle - Average Fortune', 
    '第三籤 平吉',
    '占位内容 - 第三签文的完整内容将后续添加',
    'Placeholder content - Full content of the third oracle will be added later',
    'プレースホルダー内容 - 第三籤の完全な内容は後で追加されます',
    '此签为平吉，预示着平稳的运势。',
    'This is an average fortune oracle, indicating stable fortune.',
    'これは平吉の籤で、平穏な運勢を予示しています。',
    ARRAY['婚姻', '健康'],
    'average'
);