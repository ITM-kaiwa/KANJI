import type { KanjiEntry } from "./types";
import { parsePyListString } from "./csvUtils";

/**
 * Local fallback data -- a straight snapshot of the N5 rows already stored
 * in the Supabase `kanji_db` table (kanji_integrated_supabase.csv), so the
 * app works immediately even before .env.local / Vercel env vars are set,
 * and never shows a blank screen if a Supabase query fails.
 *
 * The real data (all N5/N4/N3 rows) lives in Supabase -- this file does NOT
 * need to be kept in sync with it.
 */
const RAW_N5: Array<{
  id: number;
  kanji: string;
  on_yomi: string;
  kun_yomi: string;
  kan_viet: string;
  meaning_vn: string;
  rei: string[];
  unicode: string;
  japanese_on: string;
  vietnamese: string;
}> = [
  { id: 1, kanji: "一", on_yomi: "イチ", kun_yomi: "ひと", kan_viet: "Nhất", meaning_vn: "Một", rei: ["一日", "一つ", "一番", "一生"], unicode: "U+4E00", japanese_on: "['ICHI', 'ITSU']", vietnamese: "['nhất']" },
  { id: 2, kanji: "七", on_yomi: "シチ", kun_yomi: "なな", kan_viet: "Thất", meaning_vn: "Bảy", rei: ["七日", "七つ", "七月", "七人"], unicode: "U+4E03", japanese_on: "['SHICHI', 'SHITSU']", vietnamese: "['thất']" },
  { id: 3, kanji: "万", on_yomi: "マン", kun_yomi: "なし", kan_viet: "Vạn", meaning_vn: "Mười nghìn", rei: ["一万", "万一", "万国", "万全"], unicode: "U+4E07", japanese_on: "['MAN', 'BAN']", vietnamese: "['vạn']" },
  { id: 4, kanji: "三", on_yomi: "サン", kun_yomi: "みっ", kan_viet: "Tam", meaning_vn: "Ba", rei: ["三日", "三つ", "三人", "三角"], unicode: "U+4E09", japanese_on: "['SAN']", vietnamese: "['tam']" },
  { id: 5, kanji: "上", on_yomi: "ジョウ", kun_yomi: "うえ", kan_viet: "Thượng", meaning_vn: "Trên", rei: ["上着", "上がる", "上手", "屋上"], unicode: "U+4E0A", japanese_on: "['JOU', 'SHOU']", vietnamese: "['thượng']" },
  { id: 6, kanji: "下", on_yomi: "カ", kun_yomi: "した", kan_viet: "Hạ", meaning_vn: "Dưới", rei: ["下着", "下がる", "下手", "地下"], unicode: "U+4E0B", japanese_on: "['KA', 'GE']", vietnamese: "['hạ']" },
  { id: 7, kanji: "中", on_yomi: "チュウ", kun_yomi: "なか", kan_viet: "Trung", meaning_vn: "Trong", rei: ["中心", "一日中", "中学校", "中国"], unicode: "U+4E2D", japanese_on: "['CHUU']", vietnamese: "['trung']" },
  { id: 8, kanji: "九", on_yomi: "キュウ", kun_yomi: "ここの", kan_viet: "Cửu", meaning_vn: "Chín", rei: ["九日", "九つ", "九州", "九月"], unicode: "U+4E5D", japanese_on: "['KYUU', 'KU']", vietnamese: "['cửu']" },
  { id: 9, kanji: "二", on_yomi: "ニ", kun_yomi: "ふた", kan_viet: "Nhị", meaning_vn: "Hai", rei: ["二日", "二つ", "二人", "二月"], unicode: "U+4E8C", japanese_on: "['NI', 'JI']", vietnamese: "['nhì']" },
  { id: 10, kanji: "五", on_yomi: "ゴ", kun_yomi: "いつ", kan_viet: "Ngũ", meaning_vn: "Năm", rei: ["五日", "五つ", "五人", "五月"], unicode: "U+4E94", japanese_on: "['GO']", vietnamese: "['ngũ']" },
  { id: 11, kanji: "人", on_yomi: "ジン", kun_yomi: "ひと", kan_viet: "Nhân", meaning_vn: "Người", rei: ["日本人", "外国人", "人間", "人口"], unicode: "U+4EBA", japanese_on: "['JIN', 'NIN']", vietnamese: "['nhân']" },
  { id: 12, kanji: "今", on_yomi: "コン", kun_yomi: "いま", kan_viet: "Kim", meaning_vn: "Bây giờ", rei: ["今日", "今月", "今年", "今週"], unicode: "U+4ECA", japanese_on: "['KON', 'KIN']", vietnamese: "['kim']" },
  { id: 13, kanji: "休", on_yomi: "キュウ", kun_yomi: "やす", kan_viet: "Hưu", meaning_vn: "Nghỉ ngơi", rei: ["休み", "休日", "夏休み", "冬休み"], unicode: "U+4F11", japanese_on: "['KYUU', 'KU']", vietnamese: "['hưu']" },
  { id: 14, kanji: "何", on_yomi: "カ", kun_yomi: "なに", kan_viet: "Hà", meaning_vn: "Cái gì", rei: ["何か", "何人", "何時", "何度"], unicode: "U+4F55", japanese_on: "", vietnamese: "" },
  { id: 15, kanji: "先", on_yomi: "セン", kun_yomi: "さき", kan_viet: "Tiên", meaning_vn: "Trước", rei: ["先生", "先月", "先週", "先輩"], unicode: "U+5148", japanese_on: "['SEN']", vietnamese: "['tiên']" },
  { id: 16, kanji: "入", on_yomi: "ニュウ", kun_yomi: "はい", kan_viet: "Nhập", meaning_vn: "Vào", rei: ["入口", "入れる", "入学", "入る"], unicode: "U+5165", japanese_on: "['NYUU', 'JU', 'JUU']", vietnamese: "['nhập']" },
  { id: 17, kanji: "八", on_yomi: "ハチ", kun_yomi: "やっ", kan_viet: "Bát", meaning_vn: "Tám", rei: ["八日", "八つ", "八百屋", "八月"], unicode: "U+516B", japanese_on: "['HACHI', 'HATSU']", vietnamese: "['bát']" },
  { id: 18, kanji: "六", on_yomi: "ロク", kun_yomi: "むっ", kan_viet: "Lục", meaning_vn: "Sáu", rei: ["六日", "六つ", "六月", "六人"], unicode: "U+516D", japanese_on: "['ROKU', 'RIKU']", vietnamese: "['lục']" },
  { id: 19, kanji: "円", on_yomi: "エン", kun_yomi: "まる", kan_viet: "Viên", meaning_vn: "Tròn / Yên", rei: ["百円", "円い", "円高", "円安"], unicode: "U+5186", japanese_on: "", vietnamese: "" },
  { id: 20, kanji: "出", on_yomi: "シュツ", kun_yomi: "で", kan_viet: "Xuất", meaning_vn: "Ra", rei: ["出口", "出る", "出す", "出発"], unicode: "U+51FA", japanese_on: "['SHUTSU', 'SUI']", vietnamese: "['xuất']" },
  { id: 21, kanji: "分", on_yomi: "ブン", kun_yomi: "わ", kan_viet: "Phân", meaning_vn: "Phần / Phút", rei: ["半分", "分かる", "十分", "自分"], unicode: "U+5206", japanese_on: "['BUN', 'FUN', 'BU']", vietnamese: "['phân']" },
  { id: 22, kanji: "前", on_yomi: "ゼン", kun_yomi: "まえ", kan_viet: "Tiền", meaning_vn: "Trước", rei: ["名前", "午前", "前半", "前払い"], unicode: "U+524D", japanese_on: "['ZEN', 'SEN']", vietnamese: "['tiền']" },
  { id: 23, kanji: "北", on_yomi: "ホク", kun_yomi: "きた", kan_viet: "Bắc", meaning_vn: "Phía bắc", rei: ["北口", "北海道", "南北", "東北"], unicode: "U+5317", japanese_on: "", vietnamese: "" },
  { id: 24, kanji: "十", on_yomi: "ジュウ", kun_yomi: "とお", kan_viet: "Thập", meaning_vn: "Mười", rei: ["十日", "十回", "十分", "十字路"], unicode: "U+5341", japanese_on: "['JUU', 'JITSU']", vietnamese: "['thập']" },
  { id: 25, kanji: "千", on_yomi: "セン", kun_yomi: "ち", kan_viet: "Thiên", meaning_vn: "Nghìn", rei: ["三千", "千葉", "千円", "千代紙"], unicode: "U+5343", japanese_on: "['SEN']", vietnamese: "['thiên']" },
  { id: 26, kanji: "午", on_yomi: "ゴ", kun_yomi: "なし", kan_viet: "Ngọ", meaning_vn: "Trưa", rei: ["午前", "午後", "正午", "子午線"], unicode: "U+5348", japanese_on: "['GO']", vietnamese: "['ngọ']" },
  { id: 27, kanji: "半", on_yomi: "ハン", kun_yomi: "なか", kan_viet: "Bán", meaning_vn: "Một nửa", rei: ["半分", "半年", "半ば", "前半"], unicode: "U+534A", japanese_on: "['HAN']", vietnamese: "['bán']" },
  { id: 28, kanji: "南", on_yomi: "ナン", kun_yomi: "みなみ", kan_viet: "Nam", meaning_vn: "Phía nam", rei: ["南口", "南極", "東南", "南北"], unicode: "U+5357", japanese_on: "['NAN', 'DAN']", vietnamese: "['nam']" },
  { id: 29, kanji: "友", on_yomi: "ユウ", kun_yomi: "とも", kan_viet: "Hữu", meaning_vn: "Bạn bè", rei: ["友達", "友人", "親友", "友情"], unicode: "U+53CB", japanese_on: "['YUU']", vietnamese: "['hữu']" },
  { id: 30, kanji: "右", on_yomi: "ウ", kun_yomi: "みぎ", kan_viet: "Hữu", meaning_vn: "Bên phải", rei: ["右手", "右側", "左右", "右折"], unicode: "U+53F3", japanese_on: "['U', 'YUU']", vietnamese: "['hữu']" },
  { id: 31, kanji: "名", on_yomi: "メイ", kun_yomi: "な", kan_viet: "Danh", meaning_vn: "Tên", rei: ["名前", "有名", "名刺", "名所"], unicode: "U+540D", japanese_on: "['MEI', 'MYOU']", vietnamese: "['danh']" },
  { id: 32, kanji: "四", on_yomi: "シ", kun_yomi: "よっ", kan_viet: "Tứ", meaning_vn: "Bốn", rei: ["四日", "四つ", "四季", "四角"], unicode: "U+56DB", japanese_on: "['SHI']", vietnamese: "['tứ']" },
  { id: 33, kanji: "国", on_yomi: "コク", kun_yomi: "くに", kan_viet: "Quốc", meaning_vn: "Đất nước", rei: ["外国", "中国", "国籍", "国家"], unicode: "U+56FD", japanese_on: "", vietnamese: "" },
  { id: 34, kanji: "土", on_yomi: "ド", kun_yomi: "つち", kan_viet: "Thổ", meaning_vn: "Đất", rei: ["土曜日", "土地", "お土産", "土台"], unicode: "U+571F", japanese_on: "['DO', 'TO']", vietnamese: "['thổ']" },
  { id: 35, kanji: "外", on_yomi: "ガイ", kun_yomi: "そと", kan_viet: "Ngoại", meaning_vn: "Ngoài", rei: ["外国", "外れ", "外食", "屋外"], unicode: "U+5916", japanese_on: "['GAI', 'GE']", vietnamese: "['ngoại']" },
  { id: 36, kanji: "大", on_yomi: "ダイ", kun_yomi: "おお", kan_viet: "Đại", meaning_vn: "Lớn", rei: ["大学", "大きい", "大人", "大切"], unicode: "U+5927", japanese_on: "['TAI', 'DAI', 'TA']", vietnamese: "['đại']" },
  { id: 37, kanji: "天", on_yomi: "テン", kun_yomi: "あま", kan_viet: "Thiên", meaning_vn: "Trời", rei: ["天気", "天国", "天才", "天文"], unicode: "U+5929", japanese_on: "['TEN']", vietnamese: "['thiên']" },
  { id: 38, kanji: "女", on_yomi: "ジョ", kun_yomi: "おんな", kan_viet: "Nữ", meaning_vn: "Phụ nữ", rei: ["女の子", "女性", "長女", "彼女"], unicode: "U+5973", japanese_on: "['JO', 'NYO', 'NYOU']", vietnamese: "['nữa']" },
  { id: 39, kanji: "子", on_yomi: "シ", kun_yomi: "こ", kan_viet: "Tử", meaning_vn: "Trẻ con", rei: ["子供", "女子", "男子", "様子"], unicode: "U+5B50", japanese_on: "['SHI', 'SU']", vietnamese: "['tí']" },
  { id: 40, kanji: "学", on_yomi: "ガク", kun_yomi: "まな", kan_viet: "Học", meaning_vn: "Học", rei: ["学校", "学生", "大学", "科学"], unicode: "U+5B66", japanese_on: "", vietnamese: "" },
  { id: 41, kanji: "小", on_yomi: "ショウ", kun_yomi: "ちい", kan_viet: "Tiểu", meaning_vn: "Nhỏ", rei: ["小さい", "小学校", "小説", "小鳥"], unicode: "U+5C0F", japanese_on: "['SHOU']", vietnamese: "['tiểu']" },
  { id: 42, kanji: "山", on_yomi: "サン", kun_yomi: "やま", kan_viet: "Sơn", meaning_vn: "Núi", rei: ["富士山", "登山", "山道", "火山"], unicode: "U+5C71", japanese_on: "['SAN', 'SEN']", vietnamese: "['sơn']" },
  { id: 43, kanji: "川", on_yomi: "セン", kun_yomi: "かわ", kan_viet: "Xuyên", meaning_vn: "Sông", rei: ["河川", "川岸", "小川", "天の川"], unicode: "U+5DDD", japanese_on: "['SEN']", vietnamese: "['xuyên']" },
  { id: 44, kanji: "左", on_yomi: "サ", kun_yomi: "ひだり", kan_viet: "Tả", meaning_vn: "Bên trái", rei: ["左手", "左側", "左右", "左折"], unicode: "U+5DE6", japanese_on: "['SA']", vietnamese: "['tả']" },
  { id: 45, kanji: "年", on_yomi: "ネン", kun_yomi: "とし", kan_viet: "Niên", meaning_vn: "Năm", rei: ["今年", "去年", "毎年", "年齢"], unicode: "U+5E74", japanese_on: "['NEN']", vietnamese: "['nên']" },
  { id: 46, kanji: "後", on_yomi: "ゴ", kun_yomi: "あと", kan_viet: "Hậu", meaning_vn: "Sau", rei: ["午後", "後ろ", "最後", "後半"], unicode: "U+5F8C", japanese_on: "['GO', 'KOU']", vietnamese: "['hậu']" },
  { id: 47, kanji: "日", on_yomi: "ニチ", kun_yomi: "ひ", kan_viet: "Nhật", meaning_vn: "Ngày / Mặt trời", rei: ["日曜日", "日本", "毎日", "明日"], unicode: "U+65E5", japanese_on: "['NICHI', 'JITSU']", vietnamese: "['nhật']" },
  { id: 48, kanji: "時", on_yomi: "ジ", kun_yomi: "とき", kan_viet: "Thời", meaning_vn: "Thời gian", rei: ["時間", "時計", "時代", "時々"], unicode: "U+6642", japanese_on: "['JI', 'SHI']", vietnamese: "['thì']" },
  { id: 49, kanji: "書", on_yomi: "ショ", kun_yomi: "か", kan_viet: "Thư", meaning_vn: "Viết", rei: ["書く", "辞書", "図書館", "読書"], unicode: "U+66F8", japanese_on: "['SHO']", vietnamese: "['thư']" },
  { id: 50, kanji: "月", on_yomi: "ゲツ", kun_yomi: "つき", kan_viet: "Nguyệt", meaning_vn: "Tháng / Mặt trăng", rei: ["月曜日", "今月", "毎月", "満月"], unicode: "U+6708", japanese_on: "['GETSU', 'GATSU']", vietnamese: "['nguyệt']" },
  { id: 51, kanji: "木", on_yomi: "モク", kun_yomi: "き", kan_viet: "Mộc", meaning_vn: "Cây", rei: ["木曜日", "木村", "大木", "木造"], unicode: "U+6728", japanese_on: "['BOKU', 'MOKU']", vietnamese: "['mộc']" },
  { id: 52, kanji: "本", on_yomi: "ホン", kun_yomi: "もと", kan_viet: "Bản", meaning_vn: "Sách / Gốc", rei: ["日本", "本当", "山本", "本棚"], unicode: "U+672C", japanese_on: "['HON']", vietnamese: "['bản']" },
  { id: 53, kanji: "来", on_yomi: "ライ", kun_yomi: "く", kan_viet: "Lai", meaning_vn: "Đến", rei: ["来る", "来年", "来週", "未来"], unicode: "U+6765", japanese_on: "", vietnamese: "" },
  { id: 54, kanji: "東", on_yomi: "トウ", kun_yomi: "ひがし", kan_viet: "Đông", meaning_vn: "Phía đông", rei: ["東口", "東京", "関東", "中東"], unicode: "U+6771", japanese_on: "['TOU']", vietnamese: "['đang', 'đông']" },
  { id: 55, kanji: "校", on_yomi: "コウ", kun_yomi: "なし", kan_viet: "Hiệu", meaning_vn: "Trường học", rei: ["学校", "校長", "高校", "小学校"], unicode: "U+6821", japanese_on: "['KOU', 'KYOU']", vietnamese: "['chò', 'giâu', 'hiệu']" },
  { id: 56, kanji: "母", on_yomi: "ボ", kun_yomi: "はは", kan_viet: "Mẫu", meaning_vn: "Mẹ", rei: ["お母さん", "父母", "母国", "祖母"], unicode: "U+6BCD", japanese_on: "['BO', 'BOU', 'MO']", vietnamese: "['mẫu']" },
  { id: 57, kanji: "毎", on_yomi: "マイ", kun_yomi: "なし", kan_viet: "Mỗi", meaning_vn: "Mỗi", rei: ["毎日", "毎月", "毎年", "毎週"], unicode: "U+6BCE", japanese_on: "", vietnamese: "" },
  { id: 58, kanji: "気", on_yomi: "キ", kun_yomi: "なし", kan_viet: "Khí", meaning_vn: "Khí / Tinh thần", rei: ["元気", "天気", "病気", "気持ち"], unicode: "U+6C17", japanese_on: "", vietnamese: "" },
  { id: 59, kanji: "水", on_yomi: "スイ", kun_yomi: "みず", kan_viet: "Thủy", meaning_vn: "Nước", rei: ["水曜日", "水道", "水泳", "香水"], unicode: "U+6C34", japanese_on: "['SUI']", vietnamese: "['thuỷ']" },
  { id: 60, kanji: "火", on_yomi: "カ", kun_yomi: "ひ", kan_viet: "Hỏa", meaning_vn: "Lửa", rei: ["火曜日", "火事", "火山", "花火"], unicode: "U+706B", japanese_on: "['KA', 'KO']", vietnamese: "['hoả']" },
  { id: 61, kanji: "父", on_yomi: "フ", kun_yomi: "ちち", kan_viet: "Phụ", meaning_vn: "Bố", rei: ["お父さん", "父母", "祖父", "父親"], unicode: "U+7236", japanese_on: "", vietnamese: "" },
  { id: 62, kanji: "生", on_yomi: "セイ", kun_yomi: "い", kan_viet: "Sinh", meaning_vn: "Sinh sống", rei: ["先生", "学生", "生活", "誕生日"], unicode: "U+751F", japanese_on: "['SEI', 'SHOU']", vietnamese: "['sinh']" },
  { id: 63, kanji: "男", on_yomi: "ダン", kun_yomi: "おとこ", kan_viet: "Nam", meaning_vn: "Đàn ông", rei: ["男の子", "男性", "長男", "男女"], unicode: "U+7537", japanese_on: "['DAN', 'NAN']", vietnamese: "['nam']" },
  { id: 64, kanji: "白", on_yomi: "ハク", kun_yomi: "しろ", kan_viet: "Bạch", meaning_vn: "Trắng", rei: ["白い", "白黒", "白鳥", "空白"], unicode: "U+767D", japanese_on: "['HAKU', 'BYAKU']", vietnamese: "['bạch']" },
  { id: 65, kanji: "百", on_yomi: "ヒャク", kun_yomi: "もも", kan_viet: "Bách", meaning_vn: "Trăm", rei: ["三百", "八百屋", "百科事典", "数百年"], unicode: "U+767E", japanese_on: "['HYAKU', 'HAKU']", vietnamese: "['bá', 'bách', 'trăm']" },
  { id: 66, kanji: "聞", on_yomi: "ブン", kun_yomi: "き", kan_viet: "Văn", meaning_vn: "Nghe", rei: ["聞く", "新聞", "見聞", "聞き手"], unicode: "U+805E", japanese_on: "", vietnamese: "" },
  { id: 67, kanji: "行", on_yomi: "コウ", kun_yomi: "い", kan_viet: "Hành", meaning_vn: "Đi", rei: ["行く", "旅行", "銀行", "行動"], unicode: "U+884C", japanese_on: "['KOU', 'GYOU', 'AN']", vietnamese: "['hàng']" },
  { id: 68, kanji: "西", on_yomi: "セイ", kun_yomi: "にし", kan_viet: "Tây", meaning_vn: "Phía tây", rei: ["西口", "関西", "東西", "西洋"], unicode: "U+897F", japanese_on: "['SEI', 'SAI']", vietnamese: "['tây']" },
  { id: 69, kanji: "見", on_yomi: "ケン", kun_yomi: "み", kan_viet: "Kiến", meaning_vn: "Nhìn", rei: ["見る", "意見", "見学", "見物"], unicode: "U+898B", japanese_on: "['KEN']", vietnamese: "['kiến']" },
  { id: 70, kanji: "話", on_yomi: "ワ", kun_yomi: "はな", kan_viet: "Thoại", meaning_vn: "Nói chuyện", rei: ["話す", "電話", "会話", "昔話"], unicode: "U+8A71", japanese_on: "['WA', 'KAI']", vietnamese: "['thoại']" },
  { id: 71, kanji: "語", on_yomi: "ゴ", kun_yomi: "かた", kan_viet: "Ngữ", meaning_vn: "Ngôn ngữ", rei: ["日本語", "英語", "単語", "敬語"], unicode: "U+8A9E", japanese_on: "['GO', 'GYO']", vietnamese: "['ngữ']" },
  { id: 72, kanji: "読", on_yomi: "ドク", kun_yomi: "よ", kan_viet: "Độc", meaning_vn: "Đọc", rei: ["読む", "読書", "読者", "音読"], unicode: "U+8AAD", japanese_on: "", vietnamese: "" },
  { id: 73, kanji: "車", on_yomi: "シャ", kun_yomi: "くるま", kan_viet: "Xa", meaning_vn: "Xe", rei: ["自動車", "電車", "自転車", "駐車場"], unicode: "U+8ECA", japanese_on: "['SHA', 'KYO']", vietnamese: "['xa']" },
  { id: 74, kanji: "金", on_yomi: "キン", kun_yomi: "かね", kan_viet: "Kim", meaning_vn: "Vàng / Tiền", rei: ["金曜日", "お金", "現金", "金庫"], unicode: "U+91D1", japanese_on: "['KIN', 'KON']", vietnamese: "['kim']" },
  { id: 75, kanji: "長", on_yomi: "チョウ", kun_yomi: "なが", kan_viet: "Trường", meaning_vn: "Dài", rei: ["長い", "社長", "校長", "成長"], unicode: "U+9577", japanese_on: "['CHOU']", vietnamese: "['trường']" },
  { id: 76, kanji: "間", on_yomi: "カン", kun_yomi: "あいだ", kan_viet: "Gian", meaning_vn: "Khoảng cách", rei: ["時間", "人間", "期間", "仲間"], unicode: "U+9593", japanese_on: "['KAN', 'KEN']", vietnamese: "['gian']" },
  { id: 77, kanji: "雨", on_yomi: "ウ", kun_yomi: "あめ", kan_viet: "Vũ", meaning_vn: "Mưa", rei: ["大雨", "雨天", "梅雨", "にわか雨"], unicode: "U+96E8", japanese_on: "", vietnamese: "" },
  { id: 78, kanji: "電", on_yomi: "デン", kun_yomi: "なし", kan_viet: "Điện", meaning_vn: "Điện", rei: ["電車", "電話", "電気", "電子"], unicode: "U+96FB", japanese_on: "", vietnamese: "" },
  { id: 79, kanji: "食", on_yomi: "ショク", kun_yomi: "た", kan_viet: "Thực", meaning_vn: "Ăn", rei: ["食べる", "食事", "食堂", "食べ物"], unicode: "U+98DF", japanese_on: "", vietnamese: "" },
  { id: 80, kanji: "高", on_yomi: "コウ", kun_yomi: "たか", kan_viet: "Cao", meaning_vn: "Cao", rei: ["高い", "高校", "最高", "高級"], unicode: "U+9AD8", japanese_on: "['KOU']", vietnamese: "['cao']" },
];

export const SAMPLE_KANJI: KanjiEntry[] = RAW_N5.map((r) => ({
  id: r.id,
  kanji: r.kanji,
  jlpt_level: "N5",
  on_yomi: r.on_yomi,
  kun_yomi: r.kun_yomi,
  kan_viet: r.kan_viet,
  meaning_vn: r.meaning_vn,
  rei: r.rei,
  unicode: r.unicode || null,
  onyomiAlt: parsePyListString(r.japanese_on),
  hanVietAlt: parsePyListString(r.vietnamese),
}));
