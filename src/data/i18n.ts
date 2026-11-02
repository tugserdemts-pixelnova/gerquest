import { D, QX, IX, type Extra } from "./parts";

export type Lang = "mn" | "en";
export type LabelKey = "toono" | "roof" | "uni" | "bagana" | "cover" | "wall" | "belt" | "door" | "floor" | "felt";
// [name, short name, paragraph 1, paragraph 2, question, options]
export type PartText = [string, string, string, string, string, string[]];

// L[lang].P[i] = part text for D[i] · Q = extra questions · B[key] = [ok, early] · lb = hero labels (lbS = short, narrow screens)
const RAW={mn:{
 title:"Монгол гэр 3D аялал",h1:"Монгол гэр",hint1:"Доош гүйлгэж гэрийн хэсгүүдийг харна уу ↓ · Гэрийг чирж эргүүлээрэй",hint2:"Доош гүйлгэж замаар яваарай ↓",
 next:"Дараах ➜",close:"Хаах",quiz:"❓ Асуулт",get:"🎁 Авах",nq:"Дараагийн асуулт ➜",back:"← Тайлбар",right:"Зөв! 🎉",wrong:"Буруу ✗ Зөв хариултыг ногооноор тэмдэглэлээ. Дараагийн асуултад оролдоорой!",
 congrats:"Баяр хүргэе! Та гэрийн {n} хэсгийг бүгдийг нь цуглуулж чадлаа.",inv:"🛖 Гэрийн хэсгүүд",invT:"Гэрийн хэсгүүд",reset:"Дахин эхлэх",
 build:"🔨 Гэр барих",buildT:"Гэр барих",exit:"✕ Гарах",tip:"Хэсгүүдийг зөв дарааллаар нь гэр дээр чирж тавиарай.",
 notYet:"✗ Арай болоогүй! «{part}»-ийн ээлж биш.",placeNext:"👉 Одоо тавих хэсэг: «{part}»",gotIt:"Ойлголоо",ready:"🏆 Гэр бэллээ!",
 builtMsg:"Та Монгол гэрийг зөв дарааллаар нь өөрөө барилаа. Алдаа: {n}",again:"↺ Дахин барих",
 loginT:"Нэвтрэх",signupT:"Бүртгүүлэх",loginSub:"Гэрийн аялалаа үргэлжлүүлэхийн тулд нэвтэрнэ үү.",email:"Имэйл",password:"Нууц үг",
 signIn:"Нэвтрэх ➜",signUp:"Бүртгүүлэх ➜",toSignUp:"Бүртгэлгүй юу? Бүртгүүлэх",toSignIn:"Бүртгэлтэй юу? Нэвтрэх",signOut:"Гарах",wait:"Түр хүлээнэ үү…",
 checkEmail:"Бүртгэл үүслээ! Имэйлээ шалгаж, холбоос дээр дарж баталгаажуулна уу.",pwShort:"Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.",
 noConfig:"Supabase тохируулагдаагүй байна: .env.local файлд NEXT_PUBLIC_SUPABASE_URL болон NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY-г бичнэ үү.",
 lb:{toono:"тооно",roof:"дээд бүрээс",uni:"унь",bagana:"багана",cover:"бүрээс",wall:"хана",belt:"бүслүүр",door:"хаалга",floor:"шал",felt:"туурга"},
 B:{"шал":["Шал бол гэрийн суурь. Бүх зүйл үүн дээр тогтоно.",""],
  "хана":["Ханаа шалыг тойруулан дэлгэж, хооронд нь дээсээр холболоо.","Хана шалан дээр тойрон зогсдог. Суурь шалгүй бол хана тэгш, тогтвортой зогсохгүй."],
  "хаалга":["Хаалгыг ханын хоёр үзүүрийн завсарт босгож холболоо.","Хаалга ганцаараа зогсож чадахгүй — түүнийг ханын хоёр үзүүрт холбож бэхэлдэг."],
  "бүслүүр":["Дотуур бүслүүрээр ханаа тойруулан чангаллаа. Одоо хана тэлэхгүй.","Бүслүүр бол хаалганы нэг талаас нөгөө тал хүртэл ханыг тойруулж татдаг дээс. Хана, хаалга хоёр босоогүй бол бүслэх юм алга."],
  "багана":["Хоёр багана гэрийн голд босов. Одоо тооноо өргөхөд бэлэн.","Багана босгохоос өмнө хана, хаалгаа бүслүүрээр чангалсан байх ёстой. Тэгэхгүй бол дээврийн жин ханыг гадагш түлхэж, гэр хазайна."],
  "тооно":["Тооныг баганаар тулж дээш өргөлөө.","Тооно агаарт өөрөө тогтохгүй — түүнийг хоёр баганаар тулж өргөдөг."],
  "унь":["Унийн нарийн үзүүрийг тооны нүхэнд, нөгөө үзүүрийг ханын толгойд өлгөлөө.","Унийн нэг үзүүр тооны нүхэнд, нөгөө үзүүр ханын толгойд тогтдог. Тооно, хана хоёулаа бэлэн байх хэрэгтэй."],
  "туурга":["Эсгий туургаар гэрээ дулаалж хучлаа.","Туурга бол гэрийн модыг гаднаас нь хучдаг эсгий. Хана, унь бүрэн босоогүй бол эсгий тогтох газаргүй."],
  "бүрээс":["Цагаан бүрээсээ нөмөргөж, гадуур бүслүүрээр чангаллаа.","Бүрээс бол хамгийн гадна талын давхарга. Эсгийг бороо, салхинаас хамгаалдаг тул туурганы дараа, хамгийн сүүлд нөмөргөнө."]}
},en:{
 title:"Mongolian Ger 3D Tour",h1:"Mongolian Ger",hint1:"Scroll down to see the parts of the ger ↓ · Drag the ger to turn it",hint2:"Scroll down to follow the path ↓",
 next:"Next ➜",close:"Close",quiz:"❓ Question",get:"🎁 Collect",nq:"Next question ➜",back:"← Info",right:"Correct! 🎉",wrong:"Wrong ✗ The right answer is marked in green. Try the next question!",
 congrats:"Well done! You collected all {n} parts of the ger.",inv:"🛖 Ger parts",invT:"Ger parts",reset:"Start again",
 build:"🔨 Build the ger",buildT:"Build the ger",exit:"✕ Exit",tip:"Drag the parts onto the ger in the right order.",
 notYet:"✗ Not yet! It isn't the turn of «{part}».",placeNext:"👉 Place this next: «{part}»",gotIt:"Got it",ready:"🏆 The ger is ready!",
 builtMsg:"You built a Mongolian ger yourself, in the right order. Mistakes: {n}",again:"↺ Build again",
 loginT:"Log in",signupT:"Sign up",loginSub:"Log in to carry on with your ger tour.",email:"Email",password:"Password",
 signIn:"Log in ➜",signUp:"Sign up ➜",toSignUp:"No account? Sign up",toSignIn:"Already have an account? Log in",signOut:"Log out",wait:"Please wait…",
 checkEmail:"Account created! Check your email and click the link to confirm it.",pwShort:"The password must be at least 6 characters.",
 noConfig:"Supabase isn't set up: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
 lb:{toono:"Roof ring (toono)",roof:"Roof cover",uni:"Roof poles (uni)",bagana:"Pillars (bagana)",cover:"Cover (bürees)",wall:"Lattice wall (khana)",belt:"Belt (büslüür)",door:"Door (khaalga)",floor:"Floor (shal)",felt:"Felt (tuurga)"},
 lbS:{toono:"Toono",roof:"Roof cover",uni:"Poles",bagana:"Pillars",cover:"Cover",wall:"Wall",belt:"Belt",door:"Door",floor:"Floor",felt:"Felt"},
 P:[
 ["Lattice wall (khana)","Wall","A Mongolian ger is named by how many wall sections it has (4, 5, 6, 8, 10 or 12). For example: a five-wall ger, an eight-wall ger, a big five-wall ger, a small five-wall ger, and so on.","The roof poles hang on the tops of the wall, and the roof and felt covers meet there. That is why the wall tops have nice, smooth, pointed tips. The wall sections are tied to each other with rope.","Where does the name “five-wall ger” come from?",["From the number of walls","From its colour","From the door"]],
 ["Roof ring (toono)","Toono","The toono is the round ring frame of a Mongolian ger, with a cross shape in its middle. It lets light in, lets smoke and steam out, and holds the roof poles. The toono matters a lot for making the space inside bigger or smaller, for bringing light into the ger, and for giving the ger its shape.","The toono is mostly painted red or orange. This is linked to the symbol of the sun.","What does the toono do?",["It works as a door","It lets light in and smoke out","It works as a floor"]],
 ["Roof poles (uni)","Poles","Inside a Mongolian ger, the roof poles stand for the rays of the sun.","After the toono is set in the centre, the poles are hung from the front right and front left, and from the middle of the back out to both sides. Once the poles are hung, you look at the wooden frame and the toono from every side and adjust them to match the height of the walls.","What do the roof poles stand for?",["Moonlight","The rays of the sun","The direction of the wind"]],
 ["Pillars (bagana)","Pillars","When a ger is put up or taken down, the pillars are used to lift and lower the toono. A level toono keeps the ger from leaning or falling in a storm. The height of the pillars sets the height of the ger.","Mongolians think of the pillars as the upright axis of the world, and as the legs that hold a person up.","What do Mongolians compare the pillars to?",["The upright axis of the world","The door of the ger","The floor of the ger"]],
 ["Belt (büslüür)","Belt","The belt of a ger is the flat woven rope that is wrapped and tied around the walls. There is an inner belt and an outer belt. Belts are made from the hair of horses' manes and tails.","The upper parts of the ger (the toono, the roof poles and the roof) press, bulge, spread and stretch. The inner belt is the main thing that keeps all of these forces in balance.","What are belts made of?",["Sheep's wool","Wood","Hair from horses' manes and tails"]],
 ["Cover (bürees)","Cover","The cover is the set of felt and cloth parts that protects the ger from the weather outside (cold, heat, sun, wind, rain and snow),","and keeps the inside warm, cosy, clean and tidy.","What is the cover for?",["To protect the ger from the weather outside","To make the floor of the ger","To hold the toono in place"]],
 ["Felt (tuurga)","Felt","Long ago, the roof and wall covers (tuurga) were made from the skins of deer, gazelles and antelopes.","Its job is to keep the roof and walls of the ger steady, and the belts are made by twisting hair into rope. The belts of a ger stand for staying strong through the three times (past, present and future) and the three ages of life (young, grown-up and old).","Long ago, what skins was the tuurga made from?",["Cow skin","Skins of deer, gazelles and antelopes","Camel skin"]],
 ["Door (khaalga)","Door","From long ago, people went in and out of a felt ger by lifting up a hanging flap of quilted felt. This was the door of the ger.","In modern times, from the 18th and 19th centuries, people began to use wooden doors.","Long ago, what was the door of a ger made of?",["Quilted felt","Iron","Glass"]],
 ["Floor (shal)","Floor","The floor is the base of a Mongolian ger. It is one of the most important parts, because it decides how well the ger keeps warm and how comfortable it is.","It is usually put together in sections from larch or pine boards (size 2, 2.5 or 3 boards).","What is the floor usually made of?",["Felt","Stone","Larch or pine boards"]]],
 Q:[
 [["What are the wall sections tied together with?",["Rope","Iron","Glass"]],["How many wall sections can a ger have?",["4, 5, 6, 8, 10 or 12","1, 2 or 3","20 or 30"]]],
 [["What shape is the toono?",["A round ring frame","A square box","A flat triangle"]],["What colours is the toono mostly painted?",["Red and orange","Black and green","Blue and pink"]]],
 [["When are the roof poles hung?",["After the toono is set in the centre","Before the floor is made","After the door is made"]],["What height are the roof poles adjusted to match?",["The height of the walls","The height of the floor","The height of the door"]]],
 [["When a ger is put up or taken down, what do the pillars lift?",["The toono","The door","The floor"]],["What does the height of the pillars set?",["The height of the ger","The colour of the ger","The number of walls"]]],
 [["What kinds of belt are there?",["Inner and outer","Upper and lower","Front and back"]],["What is the belt of a ger?",["The flat woven rope tied around the walls","The felt of the door","The boards of the floor"]]],
 [["What is the cover set made of?",["Felt and cloth","Iron","Stone"]],["How does the cover keep the inside of the ger?",["Warm, cosy, clean and tidy","Dark and cold","Wet and muddy"]]],
 [["What is the job of the tuurga?",["Keeping the roof and walls steady","Letting light in","Making the floor"]],["What is the belt that holds the tuurga made of?",["Hair","Iron","Wood"]]],
 [["From which centuries did people start using wooden doors?",["The 18th and 19th centuries","The 5th century","The 21st century"]],["Long ago, how did people go in and out of a ger?",["By lifting up a felt flap","By pushing a glass door","By crawling through a tunnel"]]],
 [["The floor is an important part that decides what?",["How warm and comfortable the ger is","The colour of the ger","The shape of the door"]],["What boards is the floor put together from?",["Size 2, 2.5 or 3 boards","Size 10 boards","Size 50 boards"]]]],
 B:{"шал":["The floor is the base of the ger. Everything stands on it.",""],
  "хана":["You opened the lattice walls around the floor and tied them together with rope.","The walls stand in a circle on the floor. Without the floor they can't stand level and steady."],
  "хаалга":["You stood the door in the gap between the two wall ends and tied it in.","The door can't stand on its own. It is tied to the two ends of the wall."],
  "бүслүүр":["You tightened the inner belt around the walls. Now they can't spread.","The belt is a rope pulled around the walls from one side of the door to the other. With no walls and door standing, there is nothing to tie."],
  "багана":["Two pillars stand in the middle of the ger, ready to lift the toono.","Before raising the pillars, the walls and door must be tightened with the belt. Otherwise the weight of the roof pushes the walls outward and the ger leans."],
  "тооно":["You lifted the toono up on the pillars.","The toono can't float in the air. It is held up by the two pillars."],
  "унь":["You set the thin end of each pole into the toono and hung the other end on top of the wall.","One end of each pole sits in the toono and the other on top of the wall. Both the toono and the walls must be ready."],
  "туурга":["You wrapped the ger in felt to keep it warm.","The felt covers the wooden frame from the outside. Until the walls and poles are up, it has nothing to rest on."],
  "бүрээс":["You pulled on the white cover and tightened it with the outer belts.","The cover is the outermost layer. It protects the felt from rain and wind, so it goes on last, after the felt."]}
}};

type Strings = Omit<typeof RAW.en, "P" | "Q" | "lbS" | "B"> & {
  B: Record<string, [string, string]>;
  P: PartText[];
  Q: Extra[][];
  lbS?: Record<LabelKey, string>;
};
export type TextKey = { [K in keyof Strings]-?: Strings[K] extends string ? K : never }[keyof Strings];

// Mongolian part text lives in D / QX; D[i][0] stays the internal key
export const L: Record<Lang, Strings> = {
  mn: { ...RAW.mn, P: D.map((d) => [d[0], d[0], d[2], d[3], d[4], d[5]] as PartText), Q: QX } as unknown as Strings,
  en: RAW.en as unknown as Strings,
};

export const t = (lang: Lang, k: TextKey, v?: Record<string, string | number>) => {
  let s: string = L[lang][k];
  if (v) for (const q in v) s = s.split("{" + q + "}").join(String(v[q]));
  return s;
};
export const nm = (lang: Lang, k: string, short?: boolean) => L[lang].P[IX[k]][short ? 1 : 0];
