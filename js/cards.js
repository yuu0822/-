const cards = [

{
  name:"火",
  rarity:"N",
  image:"火.png",
  evolvesTo:"炎"
},

{
  name:"炎",
  rarity:"SSR",
  image:"炎.png",
  evolvesFrom:"火",
  evolvesTo:"焱"
},

{
  name:"焱",
  rarity:"UR",
  image:"焱.png",
  evolvesFrom:"炎",
  skill:"draw_fire"
},

{
  name:"水",
  rarity:"N",
  image:"水.png",
  evolvesTo:"永"
},

{
  name:"永",
  rarity:"SSR",
  image:"永.png",
  evolvesFrom:"水",
  evolvesTo:"泳"
},

{
  name:"泳",
  rarity:"UR",
  image:"泳.png",
  evolvesFrom:"永",
  bushu:"さんずい",
  skill:"draw_water"
},

{
  name:"木",
  rarity:"N",
  image:"木.png",
  evolvesTo:"林"
},

{
  name:"林",
  rarity:"SSR",
  image:"林.png",
  bushu:"きへん",
  evolvesFrom:"木",
  evolvesTo:"森"
},

{
  name:"森",
  rarity:"UR",
  image:"森.png",
  evolvesFrom:"林",
  skill:"draw_triangle"
},

{
  name:"光",
  rarity:"UR",
  image:"光.png",
  skill:"reveal_hand"
},

{
  name:"陰",
  rarity:"UR",
  image:"陰.png",
  skill:"revive"
},

{
  name:"波",
  rarity:"SSR",
  image:"波.png",
  bushu:"さんずい"
},

{
  name:"渚",
  rarity:"SSR",
  image:"渚.png",
  bushu:"さんずい"
},

{
  name:"汁",
  rarity:"SSR",
  image:"汁.png",
  bushu:"さんずい"
},

{
  name:"洗",
  rarity:"SSR",
  image:"洗.png",
  bushu:"さんずい"
},

{
  name:"氷",
  rarity:"SSR",
  image:"氷.png"
},

{
  name:"棚",
  rarity:"SSR",
  image:"棚.png",
  bushu:"きへん"
},

{
  name:"杞",
  rarity:"SSR",
  image:"杞.png",
  bushu:"きへん"
},

{
  name:"柊",
  rarity:"SSR",
  image:"柊.png",
  bushu:"きへん"
},

{
  name:"材",
  rarity:"SSR",
  image:"材.png",
  bushu:"きへん"
},

{
  name:"灯",
  rarity:"SSR",
  image:"灯.png",
  bushu:"火へん"
},

{
  name:"焼",
  rarity:"SSR",
  image:"焼.png",
  bushu:"火へん"
},

{
  name:"煙",
  rarity:"SSR",
  image:"煙.png"
},

{
  name:"焚",
  rarity:"N",
  image:"焚.png"
},

{
  name:"竹",
  rarity:"N",
  image:"竹.png"
},

{
  name:"荒",
  rarity:"N",
  image:"荒.png"
},

{
  name:"炭",
  rarity:"N",
  image:"炭.png"
},

{
  name:"外",
  rarity:"N",
  image:"外.png"
},

{
  name:"本",
  rarity:"N",
  image:"本.png"
},

{
  name:"戸",
  rarity:"N",
  image:"戸.png"
},

{
  name:"書",
  rarity:"N",
  image:"書.png"
},

{
  name:"枸",
  rarity:"N",
  image:"枸.png",
  bushu:"きへん"
},

{
  name:"汀",
  rarity:"N",
  image:"汀.png",
  bushu:"さんずい"
},

{
  name:"果",
  rarity:"N",
  image:"果.png"
},

{
  name:"濯",
  rarity:"N",
  image:"濯.png",
  bushu:"さんずい"
},

{
  name:"塊",
  rarity:"N",
  image:"塊.png"
},

{
  name:"雑",
  rarity:"N",
  image:"雑.png"
},

{
  name:"憂",
  rarity:"N",
  image:"憂.png"
},

{
  name:"料",
  rarity:"N",
  image:"料.png"
},

{
  name:"遠",
  rarity:"N",
  image:"遠.png"
},

{
  name:"死",
  rarity:"N",
  image:"死.png"
},

{
  name:"突",
  rarity:"N",
  image:"突.png"
},

{
  name:"寒",
  rarity:"N",
  image:"寒.png"
},

{
  name:"中",
  rarity:"N",
  image:"中.png"
},

{
  name:"羅",
  rarity:"N",
  image:"羅.png"
},

{
  name:"万",
  rarity:"N",
  image:"万.png"
},

{
  name:"象",
  rarity:"N",
  image:"象.png"
},

{
  name:"色",
  rarity:"N",
  image:"色.png"
},

{
  name:"反",
  rarity:"N",
  image:"反.png"
},

{
  name:"応",
  rarity:"N",
  image:"応.png"
},

{
  name:"流",
  rarity:"N",
  image:"流.png",
  bushu:"さんずい"
},

];

cards.forEach((card, index) => {
    card.no = index + 1;
});


const typeMap = {
  "火":"○",
  "炎":"○",
  "焱":"○",
  "煙":"○",
  "塊":"○",
  "外":"○",
  "色":"○",
  "焼":"○",
  "炭":"○",
  "中":"○",
  "灯":"○",
  "突":"○",
  "反":"○",
  "焚":"○",
  "万":"○",
  "羅":"○",

  "流":"□",
  "憂":"□",
  "氷":"□",
  "波":"□",
  "汀":"□",
  "濯":"□",
  "水":"□",
  "洗":"□",
  "渚":"□",
  "汁":"□",
  "死":"□",
  "寒":"□",
  "応":"□",
  "遠":"□",
  "泳":"□",
  "永":"□",
  "陰":"□",

  "果":"△",
  "荒":"△",
  "戸":"△",
  "材":"△",
  "雑":"△",
  "書":"△",
  "光":"△",
  "象":"△",
  "森":"△",
  "棚":"△",
  "竹":"△",
  "柊":"△",
  "本":"△",
  "木":"△",
  "料":"△",
  "林":"△",
  "枸":"△",
  "杞":"△"
};

cards.forEach(card => {
  card.type = typeMap[card.name];
});

const typeOrder = {
    "○":1,
    "□":2,
    "△":3
};

const rarityOrder = {
    "UR":1,
    "SSR":2,
    "N":3
};

cards.sort((a,b)=>{
    if(typeOrder[a.type] !== typeOrder[b.type]){
        return typeOrder[a.type] - typeOrder[b.type];
    }
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
});

cards.forEach((card,index)=>{
    card.no = index + 1;
});

cards.forEach(card => {
    if(!card.type){
        console.log("属性未設定:", card.name);
    }
});

console.log(cards);