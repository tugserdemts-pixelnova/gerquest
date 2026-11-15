import type { Lang } from "./i18n";
import type { Season } from "./seasons";

export type Speaker = "narr" | "host" | "hostess" | "you";
// option 0 is always the correct one; the UI shuffles them
export interface Choice { q: string; opts: string[]; ok: string; bad: string }
export interface Beat { who: Speaker; text: string; note?: string; choice?: Choice }

// the guest story that plays after the ger is built. Each beat here lines up with STAGE[i] in three/story.ts
export const STORY: Record<Lang, Beat[]> = {
  mn: [
    {
      who: "narr", text: "Та тал нутгаар аялж яваад энэ гэрт буулаа. Хаалганы өмнө том нохой хуцаж байна.",
      choice: {
        q: "Гэрт ойртоход юу хийх вэ?", opts: ["Холоос «Нохой хорь!» гэж дуудах", "Хаалга тогших", "Чимээгүй орох"],
        ok: "Зөв! Монгол гэрийн хаалгыг тогшдоггүй. Холоос «Нохой хорь!» гэж дуудахад эзэн нь гарч ирж, нохойгоо барин зочноо угтдаг.",
        bad: "Монгол гэрийн хаалгыг тогшиж, эзний зөвшөөрөлгүйгээр ордоггүй. Холоос «Нохой хорь!» гэж дуудахад эзэн нь гарч ирж, нохойгоо барьдаг.",
      },
    },
    { who: "host", text: "Нохойгоо барьчихлаа. Сайн байна уу? Сайн явж ирэв үү?" },
    { who: "you", text: "Сайн, сайн. Та сайн байна уу? Сайхан {season} байна уу?", note: "Монголчууд улиралтай холбон мэндчилдэг." },
    {
      who: "host", text: "Морилоорой, гэртээ ороорой!", note: "Орохын өмнө ташуураа гадаа үлдээж, ханцуйгаа шамласан бол буулгадаг.",
      choice: {
        q: "Гэрт орохдоо юуг анхаарах вэ?", opts: ["Босгыг алхаж давах", "Босгон дээр зогсож мэндлэх", "Хаалганы хүрээ түших"],
        ok: "Зөв! Босгыг гишгэлгүй алхаж давна. Мөн хаалганы хүрээ түшихгүйгээр ордог.",
        bad: "Босго гишгэх, босгон дээр зогсох, хаалганы хүрээ түшиж орохыг цээрлэдэг. Босгыг алхаж даван, шууд орно.",
      },
    },
    {
      who: "narr", text: "Гэрт дулаахан, зуухан дээр цай буцалж байна.",
      choice: {
        q: "Гэрт ормогц хаашаа явах вэ?", opts: ["Зүүн гар тийш эргэж, нар зөв явах", "Хоёр баганын дундуур шууд хоймор руу явах", "Зуухны дэргэд зогсох"],
        ok: "Зөв! Гэрийн хаалга урагш хардаг тул зочин зүүн гар тийш эргэн, нар зөв чиглэлээр явж гэрийн баруун талд суудаг. Багана түшдэггүй.",
        bad: "Зочин хоёр баганын дундуур явдаггүй, багана түшдэггүй. Хоймор бол гэрийн хамгийн хүндтэй газар. Зочин зүүн гар тийш эргэн, нар зөв чиглэлээр явж гэрийн баруун талд суудаг.",
      },
    },
    { who: "host", text: "Суугаарай, суугаарай. Мал сүрэг тарган тавтай юу? Танайхан сайн уу?", note: "Зочин хөлөө сунгахдаа хөлийн улыг зуух эсвэл хоймор руу чиглүүлдэггүй." },
    { who: "narr", text: "Эрэгтэйчүүд хөөрөг солилцон мэндчилдэг. Эзэн хөөргөө баруун гартаа барина. Зочин баруун гараараа авч, бөглөөг нь бага зэрэг сөхөж үнэрлээд буцаан өгнө." },
    {
      who: "hostess", text: "Цайлаарай. Халуухан сүүтэй цай.",
      choice: {
        q: "Аягатай цайг хэрхэн авах вэ?", opts: ["Баруун гараараа эсвэл хоёр гараараа авах", "Зүүн гараараа авах", "Ширээн дээр тавиулах"],
        ok: "Зөв! Аягатай цайг баруун гараараа авч, зүүн гараараа тохойг нь түшиж болно. Эсвэл хоёр гараараа хүндэтгэн авдаг.",
        bad: "Цайг зүүн гараараа авахыг хүндэтгэлгүйд тооцдог. Баруун гараараа авч, зүүн гараараа тохойг нь түшиж болно. Эсвэл хоёр гараараа авна.",
      },
    },
    { who: "hostess", text: "Идээнээс амсаарай. Шинэ ааруул, өрөм, боорцог байна.", note: "Тавагтай идээг зочинд түрүүлж барьдаг бөгөөд зочин идээнээс ядаж амсдаг. Зуны улиралд айраг барина." },
    { who: "you", text: "Баярлалаа. Сайхан зочиллоо. Одоо буцъя." },
    { who: "host", text: "Аян замдаа сайн яваарай. Дахин зочлоорой!" },
    { who: "narr", text: "Таньдаг, таньдаггүй хэн ч ирсэн, монголчууд зочноо ийнхүү угтдаг. Алс холоос ирсэн аялагч ч айл бүрээс халуун цай, идээ хүртдэг." },
  ],
  en: [
    {
      who: "narr", text: "You have been riding across the steppe and you stop at this ger. A big dog is barking at the door.",
      choice: {
        q: "What do you do as you come near?", opts: ["Call out “Nokhoi khori!” (Hold the dog!)", "Knock on the door", "Walk in quietly"],
        ok: "Right! Nobody knocks on a ger door. You call out from a distance, and the host comes out, holds the dog and greets you.",
        bad: "Nobody knocks on a ger door or walks in unannounced. You call out “Nokhoi khori!” from a distance, and the host comes out and holds the dog.",
      },
    },
    { who: "host", text: "I've got the dog. Hello! Did you have a good journey?" },
    { who: "you", text: "Hello to you too! {season}", note: "Mongolians greet each other with the season." },
    {
      who: "host", text: "Welcome! Come in, come in!", note: "Before going in, you leave your riding whip outside and roll your sleeves down.",
      choice: {
        q: "What do you watch for at the door?", opts: ["Step over the threshold, never on it", "Stop on the threshold to say hello", "Lean on the door frame as you go in"],
        ok: "Right! You step over the threshold and don't lean on the door frame.",
        bad: "Stepping or standing on the threshold is taboo, and so is leaning on the frame. You step over it and walk straight in.",
      },
    },
    {
      who: "narr", text: "It is warm inside, and tea is boiling on the stove.",
      choice: {
        q: "Where do you go once inside?", opts: ["Left, moving clockwise", "Straight between the two columns to the back", "Stay by the stove"],
        ok: "Right! The door faces south, so a guest moves left, clockwise, and sits on the west side. You never lean on the columns.",
        bad: "You don't walk between the columns or lean on them, and the back of the ger is the place of honor. A guest moves left, clockwise, and sits on the west side.",
      },
    },
    { who: "host", text: "Sit, sit. Are your animals fat and healthy? How is your family?", note: "A guest doesn't stretch out their legs or point their soles at the stove or the back of the ger." },
    { who: "narr", text: "Men greet each other by exchanging snuff bottles. The host holds his out in his right hand. You take it in your right hand, loosen the stopper a little, breathe in the scent, and hand it back." },
    {
      who: "hostess", text: "Have some tea. Hot milk tea.",
      choice: {
        q: "How do you take the bowl of tea?", opts: ["With your right hand, or both hands", "With your left hand", "Ask her to put it on the table"],
        ok: "Right! You take it with both hands, or with your right hand while your left hand supports the elbow.",
        bad: "Taking it with the left hand is disrespectful. You use both hands, or your right hand with your left supporting the elbow.",
      },
    },
    { who: "hostess", text: "Try some food. Fresh aaruul, urum and boortsog.", note: "Dairy food is offered to a guest first, and a guest always tastes at least a little. In summer there is airag too." },
    { who: "you", text: "Thank you, that was lovely. I should be going." },
    { who: "host", text: "Safe travels! Have a good road, and come back again." },
    { who: "narr", text: "Friend or stranger, this is how Mongolians welcome whoever arrives. Even a traveler from far away finds hot tea and food at every ger." },
  ],
};

// the seasonal greeting the guest gives in beat 2
const GREET: Record<Lang, Record<Season, string>> = {
  mn: { spring: "хаваржиж", summer: "зусаж", autumn: "намаржиж", winter: "өвөлжиж" },
  en: { spring: "Are you having a good spring?", summer: "Are you having a good summer?", autumn: "Are you having a good autumn?", winter: "Are you having a good winter?" },
};
export const fillSeason = (s: string, lang: Lang, season: Season) => s.replace("{season}", GREET[lang][season]);

export const STORY_UI: Record<Lang, { start: string; skip: string; finish: string; who: Record<Speaker, string> }> = {
  mn: { start: "🚪 Зочин болж орох", skip: "Алгасах", finish: "Дуусгах", who: { narr: "Өгүүлэгч", host: "Гэрийн эзэн", hostess: "Гэрийн эзэгтэй", you: "Та" } },
  en: { start: "🚪 Step in as a guest", skip: "Skip", finish: "Finish", who: { narr: "Story", host: "Host", hostess: "Hostess", you: "You" } },
};
