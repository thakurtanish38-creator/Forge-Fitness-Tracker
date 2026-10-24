export const LS='forge_v1';
export const today=()=>new Date().toLocaleDateString('en-CA');
export const dAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toLocaleDateString('en-CA')};
export const FOODS=[
 ['Roti',100,3,20,1,1,'Ingredient'],['Rice, 1 cup',200,4,44,0,1,'Ingredient'],['Dal, 1 bowl',180,10,26,4,1,'Dish'],['Paneer 100g',265,18,4,20,1,'Ingredient'],['Egg, boiled',78,6,1,5,0,'Dish'],['Chicken breast 100g',165,31,0,4,0,'Ingredient'],['Banana',105,1,27,0,1,'Ingredient'],['Oats, 1 bowl',150,5,27,3,1,'Ingredient'],['Curd, 1 bowl',100,6,8,5,1,'Ingredient'],['Whey scoop',120,24,3,2,1,'Ingredient'],['Apple',95,0,25,0,1,'Ingredient'],['Sandwich',250,9,34,8,1,'Dish'],
 ['Almonds, 10 nuts',70,3,3,6,1,'Ingredient'],['Apple, 1 small',77,0,21,0,1,'Ingredient'],['Apple, 1 medium',95,0,25,0,1,'Ingredient'],['Avocado, ½ fruit',120,2,6,11,1,'Ingredient'],['Banana, 1 small',90,1,23,0,1,'Ingredient'],['Banana, 1 medium',105,1,27,0,1,'Ingredient'],['Banana, 1 large',120,2,31,0,1,'Ingredient'],['Besan, 30 g',116,7,17,2,1,'Ingredient'],['Bread, 1 slice',80,3,14,1,1,'Ingredient'],['Brown rice, 1 cup cooked',215,5,45,2,1,'Ingredient'],['Butter, 1 tsp',34,0,0,4,1,'Ingredient'],['Chia seeds, 1 tbsp',58,2,5,4,1,'Ingredient'],['Chickpeas, ½ cup cooked',135,7,22,2,1,'Ingredient'],['Coconut, 30 g',106,1,4,10,1,'Ingredient'],['Corn, ½ cup',77,3,17,1,1,'Ingredient'],['Curd, ½ cup',60,4,5,3,1,'Ingredient'],['Curd, 1 cup',120,8,10,6,1,'Ingredient'],['Dates, 2',45,0,12,0,1,'Ingredient'],['Ghee, 1 tsp',45,0,0,5,1,'Ingredient'],['Greek yogurt, 100 g',59,10,4,0,1,'Ingredient'],['Masoor dal, ½ cup cooked',115,9,20,0,1,'Ingredient'],['Milk, ½ glass',60,3,5,3,1,'Ingredient'],['Milk, 1 glass',120,6,10,6,1,'Ingredient'],['Mixed nuts, 30 g',180,5,6,16,1,'Ingredient'],['Moong dal, ½ cup cooked',105,7,19,0,1,'Ingredient'],['Mushrooms, 100 g',22,3,3,0,1,'Ingredient'],['Oats, 30 g dry',114,4,20,2,1,'Ingredient'],['Oats, ½ cup cooked',75,3,14,1,1,'Ingredient'],['Olive oil, 1 tsp',40,0,0,5,1,'Ingredient'],['Paneer, 50 g',133,9,2,10,1,'Ingredient'],['Paneer, 100 g',265,18,4,20,1,'Ingredient'],['Peanut butter, 1 tbsp',95,4,3,8,1,'Ingredient'],['Peanuts, 30 g',170,7,5,14,1,'Ingredient'],['Quinoa, 1 cup cooked',222,8,39,4,1,'Ingredient'],['Rajma, ½ cup cooked',115,8,20,1,1,'Ingredient'],['Rice, ½ cup cooked',100,2,22,0,1,'Ingredient'],['Rice, 1 cup cooked',200,4,44,0,1,'Ingredient'],['Roti, 1 small',75,2,15,1,1,'Ingredient'],['Roti, 1 medium',100,3,20,1,1,'Ingredient'],['Roti, 2 medium',200,6,40,2,1,'Ingredient'],['Spinach, 1 cup cooked',40,5,6,0,1,'Ingredient'],['Tofu, 100 g',145,16,3,9,1,'Ingredient'],['Tomato, 1 medium',22,1,5,0,1,'Ingredient'],['Whey protein, 1 scoop',120,24,3,2,1,'Ingredient'],['Whole egg, 1',72,6,0,5,0,'Ingredient'],['Egg whites, 2',34,7,0,0,0,'Ingredient'],['Egg, 2 boiled',156,13,1,11,0,'Dish'],['Chicken breast, 100 g cooked',165,31,0,4,0,'Ingredient'],['Chicken thigh, 100 g cooked',209,26,0,11,0,'Ingredient'],['Chicken, 1 small serving',180,30,2,6,0,'Dish'],['Chicken, 1 large serving',360,60,4,12,0,'Dish'],['Fish, 100 g cooked',140,26,0,4,0,'Ingredient'],['Prawns, 100 g cooked',99,24,0,1,0,'Ingredient'],['Salmon, 100 g cooked',206,22,0,12,0,'Ingredient'],['Tuna, 100 g',132,29,0,1,0,'Ingredient'],['Mutton, 100 g cooked',250,25,0,16,0,'Ingredient'],['Chicken curry, 1 small bowl',220,24,8,10,0,'Dish'],['Chicken curry, 1 large bowl',440,48,16,20,0,'Dish'],['Fish curry, 1 bowl',210,22,6,11,0,'Dish'],['Egg curry, 1 bowl',220,13,10,14,0,'Dish'],
 ['Aloo gobi, 1 small bowl',130,4,20,4,1,'Dish'],['Aloo gobi, 1 large bowl',260,8,40,8,1,'Dish'],['Chana masala, 1 small bowl',160,8,24,4,1,'Dish'],['Chana masala, 1 large bowl',320,16,48,8,1,'Dish'],['Chole, 1 bowl',240,12,36,6,1,'Dish'],['Dal, 1 small bowl',90,5,13,2,1,'Dish'],['Dal, 1 large bowl',270,15,39,6,1,'Dish'],['Dosa, 1 plain',170,4,29,4,1,'Dish'],['Idli, 2 pieces',120,4,26,1,1,'Dish'],['Khichdi, 1 small bowl',160,6,27,3,1,'Dish'],['Khichdi, 1 large bowl',320,12,54,6,1,'Dish'],['Mixed vegetable curry, 1 bowl',180,5,24,7,1,'Dish'],['Omelette, 2 eggs',180,13,2,13,0,'Dish'],['Palak paneer, 1 small bowl',190,10,10,12,1,'Dish'],['Palak paneer, 1 large bowl',380,20,20,24,1,'Dish'],['Paneer bhurji, 1 bowl',280,18,8,20,1,'Dish'],['Poha, 1 small plate',180,4,30,5,1,'Dish'],['Poha, 1 large plate',360,8,60,10,1,'Dish'],['Rajma curry, 1 bowl',220,12,35,4,1,'Dish'],['Sambar, 1 bowl',120,6,18,3,1,'Dish'],['Vegetable pulao, 1 small bowl',190,4,33,5,1,'Dish'],['Vegetable pulao, 1 large bowl',380,8,66,10,1,'Dish'],['Veg sandwich, 1 small',220,8,30,7,1,'Dish'],['Veg sandwich, 1 large',440,16,60,14,1,'Dish'],['Raita, 1 bowl',90,5,8,4,1,'Dish'],['Salad, 1 bowl',70,3,12,2,1,'Dish'],['Pasta, 1 small bowl',260,9,44,6,1,'Dish'],['Pasta, 1 large bowl',520,18,88,12,1,'Dish'],['Pizza, 1 slice',285,12,36,10,1,'Dish'],['Upma, 1 bowl',220,6,35,6,1,'Dish'],['Vegan tofu stir-fry, 1 bowl',240,17,20,11,1,'Dish'], ['Chicken biryani, 1 small plate',350,18,45,11,0,'Dish'],['Chicken biryani, 1 large plate',700,36,90,22,0,'Dish'],['Fish, 1 small fillet',140,26,0,4,0,'Dish'],['Fish, 1 large fillet',280,52,0,8,0,'Dish'],['Mutton curry, 1 bowl',320,25,8,21,0,'Dish'],['Prawn curry, 1 bowl',190,23,10,7,0,'Dish'],['Turkey breast, 100 g cooked',135,30,0,1,0,'Ingredient'],
 ['Atta, whole wheat flour, 100 g',340,13,72,2,1,'Ingredient'],['Basmati rice, 1 cup cooked',205,4,45,0,1,'Ingredient'],['Millet, 1 cup cooked',207,6,41,2,1,'Ingredient'],['Ragi flour, 100 g',336,7,72,1,1,'Ingredient'],['Barley, 1 cup cooked',193,4,44,1,1,'Ingredient'],['Cornflakes, 30 g',110,2,25,0,1,'Ingredient'],['Whole wheat bread, 1 slice',85,4,15,1,1,'Ingredient'],['Paratha, 1 plain',260,6,34,12,1,'Dish'],['Naan, 1 piece',270,8,45,5,1,'Dish'],
 ['Toor dal, ½ cup cooked',120,8,21,1,1,'Ingredient'],['Urad dal, ½ cup cooked',120,8,20,1,1,'Ingredient'],['Chana dal, ½ cup cooked',130,8,22,2,1,'Ingredient'],['Black beans, ½ cup cooked',115,8,20,1,1,'Ingredient'],['Green peas, ½ cup cooked',67,4,12,0,1,'Ingredient'],['Soy chunks, 30 g dry',104,16,9,1,1,'Ingredient'],['Edamame, ½ cup',100,9,8,4,1,'Ingredient'],['Hummus, 2 tbsp',70,2,6,5,1,'Dish'],
 ['Broccoli, 100 g',34,3,7,0,1,'Ingredient'],['Cauliflower, 100 g',25,2,5,0,1,'Ingredient'],['Carrot, 1 medium',25,1,6,0,1,'Ingredient'],['Cucumber, 100 g',15,1,4,0,1,'Ingredient'],['Potato, 100 g boiled',87,2,20,0,1,'Ingredient'],['Sweet potato, 100 g cooked',90,2,21,0,1,'Ingredient'],['Onion, 100 g',40,1,9,0,1,'Ingredient'],['Bell pepper, 100 g',31,1,6,0,1,'Ingredient'],['Lettuce, 100 g',15,1,3,0,1,'Ingredient'],['Cabbage, 100 g',25,1,6,0,1,'Ingredient'],['Cucumber and tomato salad, 1 bowl',45,2,9,1,1,'Dish'],
 ['Orange, 1 medium',62,1,15,0,1,'Ingredient'],['Mango, 1 cup pieces',100,1,25,1,1,'Ingredient'],['Papaya, 1 cup pieces',55,1,14,0,1,'Ingredient'],['Strawberries, 1 cup',50,1,12,0,1,'Ingredient'],['Grapes, 1 cup',104,1,27,0,1,'Ingredient'],['Guava, 1 medium',68,3,14,1,1,'Ingredient'],
 ['Low-fat milk, 1 glass',105,8,12,2,1,'Ingredient'],['Soy milk, 1 glass',100,7,8,4,1,'Ingredient'],['Unsweetened almond milk, 1 glass',35,1,2,3,1,'Ingredient'],['Buttermilk, 1 glass',60,4,7,2,1,'Ingredient'],['Cottage cheese, 100 g',98,11,3,4,1,'Ingredient'],['Mozzarella, 30 g',85,6,1,6,1,'Ingredient'],
 ['Walnuts, 30 g',196,5,4,20,1,'Ingredient'],['Cashews, 30 g',166,5,9,13,1,'Ingredient'],['Pumpkin seeds, 1 tbsp',56,3,2,5,1,'Ingredient'],['Flax seeds, 1 tbsp',55,2,3,4,1,'Ingredient'],['Sunflower seeds, 1 tbsp',52,2,2,5,1,'Ingredient'],['Sesame oil, 1 tsp',40,0,0,5,1,'Ingredient'],
 ['Idli, 1 piece',60,2,13,1,1,'Dish'],['Masala dosa, 1 serving',250,6,38,8,1,'Dish'],['Pav bhaji, 1 plate',400,10,55,16,1,'Dish'],['Vegetable upma, 1 bowl',220,6,35,6,1,'Dish'],['Samosa, 1 piece',260,5,30,14,1,'Dish'],['Rajma rice, 1 plate',420,16,70,8,1,'Dish'],['Dal khichdi, 1 bowl',230,9,38,5,1,'Dish'],['Vegetable biryani, 1 plate',380,8,62,11,1,'Dish'],['Raita, ½ bowl',55,3,5,2,1,'Dish'],['Lemon rice, 1 bowl',330,6,48,12,1,'Dish'],
 ['Egg, 1 scrambled',90,6,1,7,0,'Dish'],['Chicken breast, 100 g raw',120,23,0,3,0,'Ingredient'],['Pork, 100 g cooked',242,27,0,14,0,'Ingredient'],['Beef, 100 g cooked',250,26,0,15,0,'Ingredient'],['Sardines, 100 g',208,25,0,11,0,'Ingredient']
];
export const FOOD_CATEGORIES=['All categories','Grains & breads','Legumes & beans','Vegetables','Fruits','Dairy & alternatives','Protein','Nuts, seeds & fats','Meals & dishes'];
export const foodCategory=food=>{
 const name=food[0].toLowerCase();
 if(food[6]==='Dish')return 'Meals & dishes';
 if(/rice|roti|bread|oat|wheat|atta|millet|ragi|barley|cornflakes|naan|paratha|quinoa|pasta|corn,/.test(name))return 'Grains & breads';
 if(/dal|lentil|chickpea|chana|rajma|bean|pea|hummus|soy chunk|edamame/.test(name))return 'Legumes & beans';
 if(/broccoli|cauliflower|carrot|cucumber|potato|spinach|mushroom|tomato|onion|pepper|lettuce|cabbage|vegetable|salad/.test(name))return 'Vegetables';
 if(/banana|apple|avocado|orange|mango|papaya|strawberr|grape|guava|date|coconut/.test(name))return 'Fruits';
 if(/milk|curd|yogurt|paneer|cheese|buttermilk|cottage/.test(name))return 'Dairy & alternatives';
 if(/egg|chicken|fish|prawn|salmon|tuna|mutton|turkey|tofu|whey|pork|beef/.test(name))return 'Protein';
 if(/almond|nut|peanut|walnut|cashew|seed|oil|butter|ghee/.test(name))return 'Nuts, seeds & fats';
 return food[6]==='Dish'?'Meals & dishes':'Protein';
};
const FOOD_INGREDIENT_TERMS=[
 [/dal|lentil/,'lentils pulses masoor moong toor urad chana'],
 [/chole|chana masala/,'chickpea chana tomato onion'],
 [/rajma/,'kidney beans red beans tomato'],
 [/khichdi/,'rice lentil dal'],
 [/biryani/,'rice spices'],
 [/palak paneer/,'spinach cottage cheese paneer'],
 [/paneer bhurji/,'cottage cheese tomato onion'],
 [/sambar/,'lentil vegetables tamarind'],
 [/pav bhaji/,'potato vegetables bread bun'],
 [/poha/,'flattened rice peanuts onion'],
 [/upma/,'semolina rava vegetables'],
 [/raita/,'yogurt curd cucumber'],
 [/hummus/,'chickpea tahini sesame'],
 [/sandwich/,'bread vegetables'],
 [/curry/,'tomato onion spices'],
 [/salad/,'lettuce tomato cucumber vegetables'],
 [/pulao/,'rice vegetables'],
 [/dosa|idli/,'rice lentil'],
 [/roti|naan|paratha/,'wheat flour atta'],
];
export const foodMatchesQuery=(food,query)=>{
 const term=query.trim().toLowerCase();
 if(!term)return true;
 const name=food[0].toLowerCase();
 const ingredients=FOOD_INGREDIENT_TERMS.filter(([pattern])=>pattern.test(name)).map(([,terms])=>terms).join(' ');
 return `${name} ${ingredients}`.includes(term);
};
export const foodServingGrams=food=>{
 const name=food[0].toLowerCase();
 const grams=name.match(/(\d+)\s*g(?:\s|$)/);
 if(grams)return Number(grams[1]);
 if(name.includes('almonds, 10'))return 12;
 if(name.includes('dates, 2'))return 16;
 if(name.includes('avocado'))return 75;
 if(name.includes('egg whites, 2'))return 66;
 if(name.includes('egg, 2 boiled'))return 100;
 if(name.includes('whole egg'))return 50;
 if(name.includes('egg, boiled'))return 50;
 if(name.includes('banana'))return name.includes('small')?100:name.includes('large')?140:120;
 if(name.includes('apple'))return name.includes('small')?150:name.includes('large')?220:180;
 if(name.includes('roti'))return name.includes('2 medium')?80:name.includes('small')?30:40;
 if(name.includes('bread, 1 slice'))return 30;
 if(name.includes('pizza, 1 slice'))return 100;
 if(name.includes('½ fruit'))return 75;
 if(name.includes('½ glass'))return 120;
 if(name.includes('1 glass'))return 240;
 if(name.includes('tsp'))return 5;
 if(name.includes('tbsp'))return 15;
 if(name.includes('½ cup cooked'))return name.includes('rice')?80:90;
 if(name.includes('½ cup'))return name.includes('rice')?80:85;
 if(name.includes('1 cup cooked'))return name.includes('rice')?160:name.includes('quinoa')?185:180;
 if(name.includes('1 cup'))return name.includes('milk')?240:name.includes('yogurt')?245:160;
 if(name.includes('small bowl'))return 150;
 if(name.includes('large bowl'))return 300;
 if(name.includes('small plate'))return 200;
 if(name.includes('large plate'))return 400;
 if(name.includes('small serving'))return 150;
 if(name.includes('large serving'))return 300;
 if(name.includes('small fillet'))return 120;
 if(name.includes('large fillet'))return 240;
 if(name.includes('1 bowl'))return name.includes('salad')?180:220;
 if(name.includes('2 pieces'))return 100;
 if(name.includes('1 plain'))return 100;
 if(name.includes('1 slice'))return 100;
 if(name.includes('scoop'))return 30;
 return 100;
};
export const foodMacrosForGrams=(food,grams)=>{
 const multiplier=grams/foodServingGrams(food);
 return food.slice(1,5).map((value,index)=>index===0?Math.round(value*multiplier):Math.round(value*multiplier*10)/10);
};
export const EX={Gym:[['Bench Press',.45],['Squat',.55],['Deadlift',.6],['Lat Pulldown',.4],['Shoulder Press',.4],['Bicep Curl',.25]],Cardio:[['Running',10],['Cycling',8],['Jump Rope',12],['Incline Walk',6]],Sports:[['Cricket',5],['Football',9],['Badminton',7],['Swimming',9]]};
export const SPLIT=['Push (chest, shoulders, triceps)','Pull (back, biceps)','Legs & core','Cardio + mobility','Full body'];
export const plan=u=>{const w=+u.weight||60,t=u.type;let k=Math.round((w*32+(t==='bulky'?350:t==='aesthetic'?-250:0))/10)*10;const p=Math.round(w*(t==='fit'?1.6:2)),f=Math.round(k*.25/9);return{k,p,f,c:Math.round((k-p*4-f*9)/4)}};
export const ACC=['#1e3a8a','#2563eb','#0f766e','#7c3aed','#be185d'];
export const load=()=>{try{return JSON.parse(localStorage.getItem(LS))||{}}catch(e){return{}}};
export const dayOf=(S,e,d)=>((S.logs[e]||{})[d])||{food:[],work:[],water:0};
export const sum=(a,i)=>a.reduce((s,x)=>s+(+x[i]||0),0);
export const hasLog=x=>x.food.length||x.work.length;
