/**
 * FitTrack - Intelligent Fitness Doubt & Problem Solver Engine
 * Accurately understands natural user questions, pains, and fitness doubts.
 * Flexible token-based intent detection ensures answers are directly related to the user's question.
 */

const DOUBT_RESOLVERS = [
  // =========================================================================
  // 🩹 PAIN, FORM, INJURIES & BIOMECHANICS
  // =========================================================================
  {
    id: 'KNEE_PAIN_SQUAT',
    match: (q) => (q.includes('knee') || q.includes('knees') || q.includes('patella')) && 
                  (q.includes('hurt') || q.includes('pain') || q.includes('squat') || q.includes('lunge') || q.includes('pop') || q.includes('click') || q.includes('ache') || q.includes('injury')),
    respond: (q, ctx) => `### 🩹 Understanding Knee Pain During Squats & Leg Exercises

It is very common for lifters to experience knee discomfort, but squats and leg presses should **not** hurt when performed with proper mechanics. Here is what is likely happening and how to fix it:

#### 🔍 Most Likely Causes:
1. **Knees Caving Inward (Knee Valgus):** Weak gluteus medius causes your knees to collapse inward when pushing out of the bottom of a squat.
2. **Excessive Forward Knee Travel Without Hip Hinge:** Bending at the knees first instead of unlocking the hips pushes immense shear force directly onto the patellar tendon.
3. **Restricted Ankle Mobility:** When ankles are stiff, your heels lift or your knees are forced forward under improper angles.
4. **Incorrect Foot Stance:** Pointing toes straight ahead instead of flared slightly outwards (15–30 degrees) pinches the joint.

#### ✅ Immediate Form Fixes:
- **"Screw Your Feet Into The Floor":** Actively push your knees outward in line with your toes throughout both the descent and ascent.
- **Hip Hinge First:** Initiate the movement by pushing your hips slightly back, then sit down between your legs.
- **Warm Up The Joint:** Do 2 sets of bodyweight Spanish squats or 3 minutes of backwards treadmill walking before loading weights.
- **Temporary Substitute:** Switch to **Box Squats** (keeps shins more vertical) or **Romanian Deadlifts (RDLs)** until the irritation subsides.

⚠️ *Safety Reminder: If you feel sharp, stabbing pain, swelling, or instability, pause heavy squats immediately and consult a physical therapist or sports physician.*`
  },

  {
    id: 'LOWER_BACK_PAIN_DEADLIFT_SQUAT',
    match: (q) => (q.includes('back') || q.includes('spine') || q.includes('lumbar')) && 
                  (q.includes('pain') || q.includes('hurt') || q.includes('deadlift') || q.includes('ache') || q.includes('strain') || q.includes('spasm')),
    respond: (q, ctx) => `### 🩹 Lower Back Pain During Deadlifts & Heavy Lifts

Lower back pain is usually a sign of **lumbar flexion under load** or **poor core bracing**, rather than weak back muscles.

#### 🔍 Root Causes:
1. **Spinal Rounding ("Cat Back"):** Rounding the lower back during heavy deadlifts shifts the load from the glutes and hamstrings onto the spinal discs.
2. **Bar Drifting Away From Shins:** Every centimeter the barbell moves away from your legs multiplies the leverage and shear strain on your lumbar spine.
3. **Hyperextending at Lockout:** Leaning backwards at the top of a deadlift compresses the lumbar facet joints.
4. **Poor Core Bracing:** Breathing into your chest instead of performing the **Valsalva Maneuver** (deep 360° belly breath into your diaphragm).

#### ✅ Action Steps to Fix:
- **Engage Your Lats ("Protect Your Armpits"):** Pull your shoulders down and squeeze imaginary oranges in your armpits before the bar leaves the floor. This stabilizes the entire spine.
- **Drag The Bar Up Your Shins:** Keep the barbell in continuous contact with your shins and thighs.
- **Brace Your Core:** Take a deep breath into your belly and brace like someone is about to punch your stomach.
- **Alternative Exercises:** Try **Trap Bar (Hex Bar) Deadlifts** or **Block Pulls**, which keep the center of gravity much closer to your body.

⚠️ *If you experience radiating numbness down your leg (sciatica), stop lifting immediately and consult a spine specialist.*`
  },

  {
    id: 'SHOULDER_PAIN_CLICKING',
    match: (q) => (q.includes('shoulder') || q.includes('rotator cuff') || q.includes('deltoid')) && 
                  (q.includes('pain') || q.includes('hurt') || q.includes('click') || q.includes('pop') || q.includes('bench') || q.includes('press') || q.includes('impingement') || q.includes('ache')),
    respond: (q, ctx) => `### 🩹 Shoulder Pain & Clicking During Pressing

Shoulder clicking and anterior shoulder pain during bench press or overhead press usually stems from **subacromial impingement** or **unstable scapular positioning**.

#### 🔍 Why It Happens:
1. **Flared Elbows (The 90-Degree Mistake):** Flaring your elbows straight out to the sides pinches the supraspinatus rotator cuff tendon between your humerus and acromion.
2. **Flat Shoulder Blades:** Lying flat without retracting and depressing your shoulder blades leaves the shoulder joint unstable.
3. **Overtraining Chest vs Neglecting Upper Back:** Tight pecs and weak rear delts pull the shoulders forward into a slouched posture.

#### ✅ How to Fix Your Pressing:
- **Tuck Your Elbows to 45°–60°:** Keep your elbows at an arrow angle (↗ ↖) relative to your torso, never a 'T' shape.
- **Pinch Your Shoulder Blades Together:** "Pinch a pen between your shoulder blades" and plant them firmly into the bench before unclipping the weight.
- **Essential Warm-Up:** Perform 2 sets of 15 reps of **Face Pulls** and **External Rotator Cuff Band Rotations** before every chest and shoulder workout.
- **Use Dumbbells with Neutral Grip:** Dumbbells allow your wrists and shoulders to rotate naturally, relieving joint pressure.`
  },

  {
    id: 'DOMS_SORE_MUSCLES',
    match: (q) => q.includes('doms') || q.includes('sore') || q.includes('soreness') || q.includes('stiff') ||
                  ((q.includes('hurt') || q.includes('pain')) && (q.includes('workout') || q.includes('exercise') || q.includes('gym'))),
    respond: (q, ctx) => `### 🩹 DOMS (Muscle Soreness): Can You Still Workout?

What you are experiencing is **DOMS (Delayed Onset Muscle Soreness)**, which typically peaks 24 to 48 hours after introducing new exercises, higher volume, or eccentric load.

#### ✅ Should You Exercise While Sore?
- **YES, with modifications:** You can safely train, but **do not train the exact same sore muscle group with heavy weights**. For example, if your legs are sore, train upper body (chest/back/arms).
- **Active Recovery is Magic:** Doing light movement (a 20–30 minute brisk walk, light cycling, or bodyweight mobility drills) increases blood flow and dramatically speeds up waste clearance and recovery.

#### 💡 Proven Ways to Speed Up Recovery:
1. **Protein & Hydration:** Ensure you hit **1.6g–2.0g protein/kg** today so your muscle fibers have the amino acids needed to rebuild.
2. **Sleep:** 80% of human growth hormone (HGH) is released during slow-wave sleep. Aim for 7.5–8.5 hours.
3. **Contrast Shower or Warm Bath:** Warm water promotes vasodilation and relaxes tight muscular tissues.

*Rule of Thumb: If the soreness is a dull, spreading muscular ache, it is healthy DOMS. If it is a sharp, localized, or joint pain, take a full rest day.*`
  },

  {
    id: 'WRIST_ELBOW_PAIN',
    match: (q) => (q.includes('wrist') || q.includes('elbow')) && (q.includes('pain') || q.includes('hurt') || q.includes('ache') || q.includes('curl') || q.includes('bench')),
    respond: (q, ctx) => `### 🩹 Wrist & Elbow Discomfort During Lifts

Wrist and elbow strain usually occur when the joint is bent out of its natural neutral alignment during loaded movements.

#### 🔍 Quick Fixes:
- **Stacked Wrists:** In bench presses and overhead presses, rest the bar on the heel of your palm (Bulldog grip) directly over your forearm bones. Never let your wrists bend backwards.
- **Switch from Straight Bar to EZ-Curl Bar:** Straight barbells force your forearms into extreme supination, putting unnatural torque on your medial elbow tendons. An EZ-bar or neutral-grip dumbbell curl relieves this instantly.
- **Warm Up Forearms:** Light wrist extensions and stretches before heavy pulling or pressing sessions.`
  },

  {
    id: 'NECK_PAIN_CRUNCHES',
    match: (q) => q.includes('neck') && (q.includes('pain') || q.includes('hurt') || q.includes('crunch') || q.includes('sit up') || q.includes('ab')),
    respond: (q, ctx) => `### 🩹 Neck Pain During Crunches & Ab Workouts

If your neck hurts while doing crunches, you are likely **pulling your head with your hands** or using neck flexors instead of your abdominal muscles.

#### ✅ Form Adjustments:
1. **Fingertips By Ears, Never Behind Head:** Place your fingers gently against your temples. Do not interlock fingers behind the neck.
2. **Press Your Tongue to the Roof of Your Mouth:** This automatically activates deep neck stabilizers and prevents neck strain.
3. **Keep an Apple Between Chin and Chest:** Imagine holding an apple under your chin throughout the rep.
4. **Better Alternatives:** Switch to **Deadbugs**, **Bird-Dogs**, and **Planks** which train core anti-extension without any neck flexing.`
  },

  // =========================================================================
  // ⚖️ BODY COMPOSITION, FAT LOSS & PHYSIQUE DILEMMAS
  // =========================================================================
  {
    id: 'SKINNY_FAT_DILEMMA',
    match: (q) => q.includes('skinny fat') || q.includes('skinny-fat') || 
                  (q.includes('skinny') && (q.includes('fat') || q.includes('belly') || q.includes('bulk') || q.includes('cut'))),
    respond: (q, ctx) => `### ⚖️ The "Skinny Fat" Solution: Should You Cut or Bulk?

Being "skinny fat" means having low muscle mass combined with a moderate-to-high body fat percentage (typically stored around the lower stomach and hips).

#### ❌ The Common Mistakes:
- **Aggressive Cutting (Starving):** Makes you look more depleted and frail without giving you an athletic shape.
- **Dirty Bulking (Eating Everything):** Adds even more belly fat because your body lacks the muscular framework to partition nutrients efficiently.

#### ✅ The Right Strategy: **Body Recomposition**
1. **Eat at Maintenance Calories or a Tiny Deficit (-150 to -200 kcal):**
   - Do not starve. You need enough energy to fuel intense training while burning fat gradually.
2. **High Protein Intake:**
   - Eat **1.6g–2.0g of protein per kg of body weight** (e.g., if you weigh 68kg, aim for 110–135g protein daily).
3. **Focus on Heavy Progressive Strength Training:**
   - Lift weights 3–4 days a week. Strive to add 1 rep or small weight increments every week on compound lifts (Squat, Deadlift, Bench, Pull-up, Row).
4. **Stop Endless Cardio:**
   - Replace long exhausting runs with **8,000–10,000 daily steps** (brisk walking). Walking burns fat without depleting muscle glycogen or raising cortisol.`
  },

  {
    id: 'STUBBORN_BELLY_FAT',
    match: (q) => (q.includes('belly') || q.includes('stomach') || q.includes('love handle') || q.includes('tummy') || q.includes('waist')) && 
                  (q.includes('lose') || q.includes('fat') || q.includes('burn') || q.includes('reduce') || q.includes('flat') || q.includes('get rid')),
    respond: (q, ctx) => `### 🔥 The Truth About Losing Stubborn Belly Fat

First, let's address the most common myth: **Spot reduction is biologically impossible**. Doing 1,000 sit-ups or ab crunches strengthens your abdominal muscles, but will **not** burn the layer of fat sitting on top of them.

#### 🔍 Why Does Belly Fat Leave Last?
Belly fat (especially lower abdomen) has a higher density of **Alpha-2 adrenergic receptors**, which restrict blood flow and slow down fat mobilization compared to other body parts. Your body loses fat in reverse order of how it gained it.

#### ✅ The 4-Step Protocol for A Flat Stomach:
1. **Sustained Moderate Caloric Deficit (300–400 kcal):**
   - Fat loss must come from systemic energy deficit. Consistency over 8–16 weeks is what forces stubborn alpha-2 fat to mobilize.
2. **High Daily Step Count (NEAT):**
   - Aim for **8,000 to 10,000 steps daily**. Walking keeps insulin low and burns fat as the primary fuel source without stimulating extreme hunger.
3. **High Protein + High Fiber:**
   - Protein preserves lean mass and keeps you satiated. Eat plenty of fibrous vegetables (greens/keerai, cucumbers, beans, oats).
4. **Manage Sleep & Cortisol:**
   - Chronically elevated stress hormone (**cortisol**) directly encourages visceral abdominal fat storage. Prioritize 7–8 hours of restful sleep.`
  },

  {
    id: 'WEIGHT_LOSS_PLATEAU',
    match: (q) => q.includes('plateau') || 
                  ((q.includes('weight') || q.includes('scale')) && (q.includes('stuck') || q.includes('not moving') || q.includes('stopped') || q.includes('not losing') || q.includes('same weight'))),
    respond: (q, ctx) => `### 📉 Breaking Through a Weight Loss Plateau

If your weight has been stuck on the scale for 2 to 3 weeks, do not panic. This is a normal biological phenomenon called **Metabolic Adaptation**.

#### 🔍 Why Plateaus Happen:
1. **Hidden Calories:** Liquid calories, cooking oils (1 tbsp oil = ~120 kcal!), salad dressings, and unmeasured snacks slowly erase your deficit.
2. **Reduced Body Mass = Lower Maintenance:** As you lose 3–5 kg, your smaller body naturally burns fewer calories each day.
3. **Decreased NEAT (Subconscious Laziness):** Your body subconsciously fidgets less and walks slower to conserve energy.
4. **Water Retention from High Cortisol:** Prolonged dieting increases cortisol, which causes your fat cells to temporarily hold water.

#### ✅ How to Break the Plateau:
- **Audit Your Tracking for 3 Days:** Weigh cooking oils, sauces, and rice on a digital kitchen scale.
- **Increase Daily Steps by 2,000:** An extra 20-minute daily walk burns ~100–150 kcal without increasing hunger.
- **Try a 2-Day "Diet Break" at Maintenance Calories:**
  - Increase calories back to maintenance using healthy carbs (potatoes, rice, oats). This signals your thyroid and leptin hormones that you are not starving, flushing cortisol water!`
  },

  {
    id: 'WEIGHT_SPIKE_AFTER_GYM',
    match: (q) => (q.includes('gained weight') || q.includes('gaining weight') || q.includes('scale went up') || q.includes('heavier') || 
                  ((q.includes('weight') || q.includes('scale')) && (q.includes('increase') || q.includes('higher') || q.includes('up')))) && 
                  (q.includes('gym') || q.includes('workout') || q.includes('exercise') || q.includes('started') || q.includes('after')),
    respond: (q, ctx) => `### ⚖️ Why You Gained Weight After Starting the Gym

If you started exercising this week and the scale went UP by 1 to 2 kg, **relax: You did NOT gain fat!**

#### 🔍 What Actually Happened:
1. **Muscle Micro-Tears & Water Retention (Inflammation):** When you lift weights or do strenuous exercise, your muscles incur microscopic tears. Your body rushes blood, water, and healing nutrients to the area. This temporary water retention shows up on the scale!
2. **Glycogen Storage:** As your muscles adapt to workouts, they store more glycogen for fuel. **Every 1 gram of glycogen binds to 3 to 4 grams of water in muscle cells.**
3. **It Takes 7,700 Extra Calories to Gain 1kg of Fat:** Unless you ate massive feasts, gaining 1kg of pure fat overnight is biologically impossible.

*Verdict: Stay consistent! This initial water fluctuation stabilizes within 2 to 3 weeks, followed by steady fat loss.*`
  },

  {
    id: 'BENCH_PRESS_PLATEAU',
    match: (q) => (q.includes('bench press') || q.includes('bench')) && 
                  (q.includes('stuck') || q.includes('increase') || q.includes('plateau') || q.includes('weak') || q.includes('improve') || q.includes('heavier')),
    respond: (q, ctx) => `### 🏋️ How to Break Your Bench Press Plateau

If your bench press strength is stuck, standard linear progression has stalled. Here is the proven checklist to add 5–10kg to your press:

#### ✅ 4 High-Impact Adjustments:
1. **Fix Your Arch and Leg Drive:** Pressing completely flat without planting your feet leaks up to 20% of power. Plant feet flat under your knees, drive backwards through the floor, and keep glutes on the bench.
2. **Pause at the Chest (Spoto / 1-Second Pause):** Eliminate the trampoline bounce off your ribs. Pausing for 1 second trains raw starting strength out of the bottom hole.
3. **Strengthen Your Triceps & Upper Back:** Triceps finish the top lockout of a bench press. Add heavy **Close-Grip Bench Presses** and **Dips**. A thick upper back (heavy barbell rows) creates the stable launching pad for your chest.
4. **Increase Frequency:** Instead of benching once a week on "Chest Day", bench **2 times per week** (one heavy 5x5 day, one moderate paused 3x8 day).`
  },

  {
    id: 'SIX_PACK_ABS',
    match: (q) => (q.includes('six pack') || q.includes('6 pack') || q.includes('abs') || q.includes('abdominals')) && 
                  (q.includes('how to get') || q.includes('visible') || q.includes('reveal') || q.includes('show') || q.includes('build')),
    respond: (q, ctx) => `### 🍫 The Realistic Guide to Getting Visible Six-Pack Abs

"Abs are made in the kitchen and revealed by caloric deficit." Here is the real formula:

#### 🔬 The Body Fat Threshold:
Everyone already has abdominal muscles. They only become visible when overall body fat drops low enough:
- **Men:** Abs become visible between **10% and 14% body fat**.
- **Women:** Abs become visible between **18% and 22% body fat**.

#### ✅ The 3-Pillar Abs Strategy:
1. **Caloric Deficit:** Track daily calories in FitTrack. Maintain a 300–400 kcal deficit until subcutaneous fat over the midsection leans out.
2. **Progressive Core Hypertrophy:** Train abs like any other muscle with weights! Do **Hanging Leg/Knee Raises** and **Cable Kneeling Woodchoppers / Crunches** (3 sets of 10–15 reps, 2x per week) so the ab bricks grow thicker and pop through.
3. **Patience:** The lower two abs are usually the last fat deposits to clear on the entire body. Give yourself 10 to 16 weeks of steady tracking.`
  },

  // =========================================================================
  // 🥗 FOOD, DIET & NUTRITION MYTHS
  // =========================================================================
  {
    id: 'WHITE_RICE_AT_NIGHT',
    match: (q) => (q.includes('rice') || q.includes('carbs')) && (q.includes('night') || q.includes('dinner') || q.includes('evening') || q.includes('bedtime')),
    respond: (q, ctx) => `### 🍚 Can You Eat White Rice at Night for Weight Loss?

**YES, absolutely!** The idea that carbohydrates eaten after 6 PM or at night "magically turn into fat" is one of the biggest myths in fitness.

#### 🔬 The Science:
- **Total Energy Balance Rules All:** Your body does not possess an internal clock that converts evening carbs into fat. If you are in a daily calorie deficit, you will lose weight regardless of what time you eat.
- **Sleep Improvement:** White rice has a high glycemic index that can actually increase tryptophan and serotonin delivery to the brain, helping you fall asleep faster and sleep deeper!
- **Digestion:** Steamed white rice is hypoallergenic and easily digested without bloating your stomach before bed.

#### ✅ How to Enjoy Rice at Night Smartly:
- Keep the portion controlled: **1 medium katori (100–150g cooked)**.
- Balance the plate: Pair with **1–2 katoris of thick Dal/Sambar**, a bowl of vegetable poriyal, and a dedicated protein anchor (boiled eggs, chicken breast, fish, or paneer).`
  },

  {
    id: 'EGG_YOLKS_CHOLESTEROL',
    match: (q) => q.includes('egg') && (q.includes('yolk') || q.includes('cholesterol') || q.includes('yellow') || q.includes('whole egg')),
    respond: (q, ctx) => `### 🍳 Are Egg Yolks Bad For You? The Cholesterol Truth

**No, egg yolks are NOT bad for you!** For decades, yolks were unfairly demonized due to outdated dietary cholesterol beliefs.

#### 🔬 The Facts:
1. **Dietary vs Blood Cholesterol:** Extensive modern cardiometabolic studies show that dietary cholesterol from eggs has minimal impact on blood LDL cholesterol in 75%+ of the population. Your liver actually adjusts its own cholesterol production based on intake.
2. **The Yolk Holds 90% of the Nutrients:**
   - Vitamin D (essential for testosterone and bone strength)
   - Choline (crucial for brain and liver function)
   - Lutein and Zeaxanthin (eye health)
   - Healthy fats & half the egg's total protein (~3g in yolk, ~3.5g in white).

#### ✅ Healthy Recommendation:
- Eating **2 to 3 whole eggs daily** is safe, nutrient-dense, and highly anabolic for healthy, active individuals.
- If you need 30g+ protein in a single meal without extra fat calories, use the **1:2 or 1:3 ratio**: (e.g., 2 whole eggs + 3 egg whites).`
  },

  {
    id: 'SOYA_CHUNKS_ESTROGEN',
    match: (q) => (q.includes('soya') || q.includes('soy') || q.includes('mealmaker') || q.includes('meal maker')) && 
                  (q.includes('estrogen') || q.includes('testosterone') || q.includes('man boob') || q.includes('gynecomastia') || q.includes('safe') || q.includes('men')),
    respond: (q, ctx) => `### 🌱 Soya Chunks (Mealmaker): Does It Cause "Man Boobs" or Drop Testosterone?

**NO! This is a complete myth.** Soya chunks are one of the most powerful, affordable vegetarian protein sources on the planet.

#### 🔬 The Science Behind Phytoestrogens:
- Soya contains **isoflavones**, which are **phytoestrogens** (plant compounds). They are chemically different from human mammalian estrogen.
- Meta-analyses reviewing dozens of clinical trials found that reasonable consumption of soy has **no adverse effect on male testosterone levels or fertility**.

#### 💰 Why Soya Chunks Are a Superfood:
- **52g of Protein per 100g dry weight!** (More protein than chicken breast or paneer gram-for-gram).
- Packed with calcium, iron, and dietary fiber.
- Extremely budget-friendly across India.

#### ✅ Safe Daily Consumption:
- Enjoy **25g to 50g dry soya chunks per day** without any concerns. Boil in water, rinse, squeeze dry, and cook in your favorite masala or curry!`
  },

  {
    id: 'SOUTH_INDIAN_DIET_TAMIL_FOODS',
    match: (q) => q.includes('parotta') || q.includes('biryani') || q.includes('curd rice') || q.includes('pongal') || 
                  q.includes('upma') || q.includes('rasam') || q.includes('dosa') || q.includes('idli') || q.includes('sambar') || q.includes('sundal'),
    respond: (q, ctx) => `### 🥘 Traditional South Indian & Tamil Foods Fitness Guide

You do **not** need to abandon traditional Tamil Nadu foods to achieve a shredded or fit physique:

#### 1. Dosa & Idli:
- **Idli:** 2 idlis = ~130 kcal, 4g protein. Steam-fermented and gut-friendly. Add 2 boiled eggs or sundal to hit 18g protein.
- **Pesarattu / Ragi Dosa:** Excellent high-protein, high-fiber alternatives to regular maida/rice dosas.

#### 2. What About Parotta & Biryani?
- **Parotta:** Made of refined maida and fried in palm oil/dalda (~350 kcal per parotta with low satiety). Reserve for treat meals once every 2 weeks, or swap with whole wheat chapati/paratha.
- **Biryani:** A chicken biryani portion with breast meat offers decent protein (~25g). Keep the rice portion moderate and avoid excessive ghee or heavy salna.

#### 3. Chana Sundal (Tamil Superfood):
- 1 bowl of boiled black or white chana with mustard tempering and curry leaves provides ~12g protein and rich slow-digesting fiber for under 200 calories!`
  },

  // =========================================================================
  // 💊 SUPPLEMENTS: CREATINE, WHEY & CAFFEINE
  // =========================================================================
  {
    id: 'CREATINE_TIMING_SAFETY_HAIR_LOSS',
    match: (q) => q.includes('creatine'),
    respond: (q, ctx) => `### 💊 Everything You Need to Know About Creatine Monohydrate

Creatine Monohydrate is the **most thoroughly researched, safest, and most effective sports supplement** in the world.

#### ❓ Common Doubts Answered:
1. **Does Creatine Cause Hair Loss?**
   - **NO.** There is no clinical scientific evidence proving creatine causes baldness. A single 2009 rugby study observed slight DHT fluctuation, but it was never replicated across dozens of rigorous follow-up trials.
2. **Does It Damage Kidneys?**
   - In healthy individuals with no pre-existing kidney disease, creatine is 100% safe. It elevates serum creatinine slightly simply because creatinine is its natural metabolic byproduct.
3. **When Should You Take It?**
   - **Consistency matters far more than timing.** Take it once daily (3 to 5 grams) at any convenient time—post-workout or morning with water or carbs.
4. **Is a "Loading Phase" Required?**
   - **No.** Taking 3–5g daily will fully saturate your muscle creatine stores within 3 to 4 weeks with zero digestive distress.

#### 💧 Golden Rule:
- Drink **3.5 to 4 liters of water daily**. Creatine draws water into muscle cells (intracellular hydration), which makes your muscles look fuller and increases force output.`
  },

  {
    id: 'WHEY_PROTEIN_SAFETY',
    match: (q) => q.includes('whey'),
    respond: (q, ctx) => `### 🥛 Is Whey Protein Safe or an "Artificial Chemical"?

**Whey protein is 100% natural food.** It is not a steroid, medicine, or artificial chemical.

#### 🔍 How Whey is Made:
Whey is a natural byproduct of **cheese and curd manufacturing**. When milk is curdled, liquid whey separates from solid curds. That liquid is simply filtered, micro-filtered, and spray-dried into powder form.

#### ❓ Common Doubts:
1. **Does it hurt kidneys or liver?**
   - No. Healthy organs process protein without difficulty.
2. **Does it cause acne?**
   - For individuals sensitive to dairy proteins (especially IGF-1 in milk), Whey Concentrate may trigger minor skin breakouts. If this happens, switch to **Whey Isolate** or **Plant Pea/Rice Protein**.
3. **When to drink it?**
   - 1 scoop post-workout or between meals anytime you need a quick, high-purity 24g–27g protein boost.`
  },

  {
    id: 'PRE_WORKOUT_CAFFEINE',
    match: (q) => q.includes('pre workout') || q.includes('pre-workout') || q.includes('caffeine') || 
                  (q.includes('coffee') && (q.includes('gym') || q.includes('workout'))),
    respond: (q, ctx) => `### ⚡ Pre-Workout & Caffeine Strategy

You don't need expensive pre-workout powders filled with proprietary blends. Simple, strategic caffeine gives you 95% of the performance benefit:

#### ✅ Best Natural Option:
- **1 cup of strong Black Coffee (or 1 tsp instant coffee in warm water):**
  - Drink **30 to 45 minutes before training**.
  - Caffeine blocks adenosine receptors, boosting alertness, power output, and perceived effort tolerance.

#### ⚠️ Essential Rules:
- **Cutoff Time:** Do NOT consume caffeine within **6 to 8 hours of bedtime** as it disrupts deep restorative slow-wave sleep.
- **Hydration:** Always drink a tall glass of water alongside your pre-workout drink.`
  },

  // =========================================================================
  // 🏋️ WORKOUT STRATEGY, CARDIO & FEMALE FITNESS
  // =========================================================================
  {
    id: 'WOMEN_LIFTING_BULKY_MYTH',
    match: (q) => (q.includes('women') || q.includes('woman') || q.includes('female') || q.includes('girl')) && 
                  (q.includes('bulky') || q.includes('heavy') || q.includes('muscle') || q.includes('weights')),
    respond: (q, ctx) => `### 🏋️‍♀️ Will Lifting Heavy Weights Make Women "Bulky"?

**NO! Absolutely not.** This is one of the most persistent myths preventing women from achieving their dream physique.

#### 🔬 Why Women Do NOT Get Bulky Naturally:
1. **Hormonal Reality:** Women produce **15 to 20 times LESS testosterone** than men. Testosterone is the primary hormonal driver of large, bulky muscular hypertrophy.
2. **What Actually Happens When Women Lift Heavy:**
   - You build firm, athletic, sculpted muscle underneath the skin.
   - You create the desired **"toned" shape** (curved glutes, defined shoulders, tightened waist).
   - Your resting metabolic rate increases, meaning you burn more calories even while resting.
   - Significant improvements in **bone mineral density**, preventing osteoporosis.

*The Bottom Line: Female bodybuilders who appear very bulky spend decades with extreme caloric surpluses and exogenous hormones. Lifting weights will only make you leaner, firmer, and stronger!*`
  },

  {
    id: 'CARDIO_BEFORE_OR_AFTER_WEIGHTS',
    match: (q) => q.includes('cardio') && (q.includes('weights') || q.includes('lifting') || q.includes('before') || q.includes('after') || q.includes('first')),
    respond: (q, ctx) => `### 🏃 Cardio Before or After Weights?

The golden rule depends on your **primary fitness goal**:

#### 1. If Your Goal is Muscle Growth, Strength, or Toning:
- **Do Weights FIRST, Cardio AFTER!**
- *Why:* Lifting heavy requires high central nervous system (CNS) recruitment and intramuscular glycogen. If you run 20 minutes first, your muscles are fatigued, your form degrades, and your strength drops by 15–25%.
- Do a 5-minute dynamic warm-up, crush your lifting session, then finish with **15–20 minutes of moderate cardio**.

#### 2. If Your Goal is Marathon / 5K Endurance Training:
- Do your cardio running first, as aerobic adaptations are your priority.

#### 💡 Best Cardio for Fat Loss:
- **Incline Walking (10–12% incline, 4.5 km/h for 20 mins):** High fat oxidation with zero joint impact on knees!`
  },

  {
    id: 'HOME_WORKOUT_NO_EQUIPMENT',
    match: (q) => (q.includes('home') || q.includes('no equipment') || q.includes('no gym') || q.includes('bodyweight') || q.includes('calisthenics')) && 
                  (q.includes('workout') || q.includes('exercise') || q.includes('build muscle') || q.includes('routine')),
    respond: (q, ctx) => `### 🏠 Building Muscle at Home With Zero Equipment

You can build serious strength and lean muscle using just your bodyweight through **calisthenics progressions**:

#### 🔥 20-Minute Full-Body Home Circuit (3–4 Rounds):
1. **Push Movement (Chest/Shoulders/Triceps):**
   - *Push-ups:* 10–15 reps (Progress from incline on wall -> flat floor -> feet elevated on chair).
2. **Lower Body (Quads & Glutes):**
   - *Bulgarian Split Squats (one foot back on a couch):* 10 reps each leg.
3. **Pull Movement (Back & Biceps):**
   - *Doorframe / Under-Table Inverted Rows:* 8–12 reps.
4. **Legs & Hamstrings:**
   - *Single-Leg Romanian Deadlifts or Glute Bridges:* 12 reps each leg.
5. **Core Stability:**
   - *Plank to Push-up or Deadbugs:* 45 seconds.

*Key to Growth: Move slowly on the way down (3-second eccentric tempo) to maximize mechanical muscle tension!*`
  },

  {
    id: 'SLEEP_RECOVERY_MUSCLE',
    match: (q) => q.includes('sleep') || q.includes('insomnia') || 
                  ((q.includes('rest') || q.includes('recovery')) && (q.includes('hours') || q.includes('tired'))),
    respond: (q, ctx) => `### 😴 Sleep: The Ultimate Anabolic Multiplier

You do **not** grow muscle in the gym; you break muscle tissue down in the gym. **You rebuild and grow during deep sleep.**

#### 🔬 What Happens When You Sleep Under 6 Hours:
- **Growth Hormone Plummets:** Up to 75% of daily human growth hormone is secreted during slow-wave non-REM sleep.
- **Cortisol Spikes:** Cortisol breaks down muscle protein and stimulates belly fat storage.
- **Hunger Hormones Go Haywire:** Leptin (fullness) drops by 18%, while Ghrelin (cravings) spikes by 28%.

#### ✅ The 8-Hour Optimization Routine:
- Target **7.5 to 8.5 hours of uninterrupted sleep**.
- Keep your bedroom cool and dark.
- Stop staring at phone screens or bright lights 45 minutes before bedtime.`
  },

  {
    id: 'ALCOHOL_CHEAT_MEALS',
    match: (q) => q.includes('alcohol') || q.includes('beer') || q.includes('cheat meal') || q.includes('cheat day') || q.includes('binge'),
    respond: (q, ctx) => `### 🍷 Alcohol, Cheat Meals & Fitness Progress

#### 1. What Happens With Alcohol:
- Alcohol provides **7 kcal per gram** with zero nutritional value.
- When alcohol enters the bloodstream, your liver prioritizes alcohol oxidation and **halts fat burning (lipolysis)** completely until the alcohol is cleared.
- Heavy drinking reduces muscle protein synthesis (MPS) by ~30% and reduces testosteron-to-cortisol ratio.

#### 2. Cheat Meal Recovery Protocol:
- **Do Not Starve Yourself Tomorrow:** Starving induces a guilt-binge cycle. Resume normal scheduled meals.
- **Flush Water:** Cheat meals are high in sodium, causing temporary 1–2kg water retention. Drink 3.5L of water and take a brisk 30-minute walk.`
  }
];

/**
 * Universal Doubt & Problem Analyzer
 */
function solveFitnessDoubt(userQuery, userContext = {}) {
  if (!userQuery || typeof userQuery !== 'string') {
    return null;
  }

  const cleanQuery = userQuery.toLowerCase().trim();

  // 1. Check against specialized problem topics
  for (const resolver of DOUBT_RESOLVERS) {
    if (resolver.match(cleanQuery)) {
      return resolver.respond(cleanQuery, userContext);
    }
  }

  // 2. Semantic Analysis for Specific Questions (Nouns + Actions)
  return generateSemanticAnswer(cleanQuery, userContext);
}

/**
 * Dynamic Semantic Engine for unclassified or conversational queries
 */
function generateSemanticAnswer(q, user) {
  // Check for diet/food queries
  if (q.includes('what should i eat') || q.includes('meal plan') || q.includes('diet chart') || q.includes('breakfast') || q.includes('dinner')) {
    return `### 🥗 Personalized Meal & Nutrition Breakdown

To achieve sustainable progress, structure your plate using the **1/2 - 1/4 - 1/4 Rule**:

1. **1/2 of your plate:** Fibrous vegetables or salads (cucumbers, spinach/keerai, tomatoes, beans, cabbage) for satiety and micronutrients.
2. **1/4 of your plate:** High-quality protein anchor:
   - *Veg:* 100g Paneer, 1 cup cooked Sundal/Chana, or 40g Soya chunks.
   - *Non-Veg:* 3 boiled eggs, 120g grilled chicken, or fish curry.
3. **1/4 of your plate:** Smart complex carbohydrates (1 cup brown/white rice, 2 small chapatis, or sweet potatoes).

*Daily Calorie Reminder:* Keep within your daily calorie target of **${user.dailyCalorieTarget || 2000} kcal** with plenty of water.`;
  }

  // Check for muscle gain / bulk
  if (q.includes('muscle gain') || q.includes('build muscle') || q.includes('gain weight') || q.includes('mass')) {
    return `### 💪 Lean Muscle Building Framework

To build clean, functional muscle without excessive fat accumulation:

1. **Slight Caloric Surplus:** Consume **250 to 350 kcal above your maintenance level**.
2. **Protein Target:** Aim for **1.6g to 2.2g of protein per kg of body weight**.
3. **Progressive Overload:** Record every workout in FitTrack. Strive to beat last week's performance by either +1 repetition or +1.25kg weight.
4. **Adequate Sleep:** Prioritize 7.5 to 8 hours of quality sleep nightly for tissue repair.`;
  }

  // Check for hydration
  if (q.includes('water') || q.includes('hydration') || q.includes('drink')) {
    return `### 💧 Optimal Daily Hydration Guidelines

Water is vital for nutrient transport, joint lubrication, and peak muscular contraction:

- **Baseline Recommendation:** **30 to 35 ml per kg of body weight** (approx. 2.5 to 3.5 liters per day).
- **Workout Windows:** Sip 500ml water 1 hour before training, and 200ml every 20 minutes during intense exercise.
- **Electrolytes:** If sweating heavily, add a pinch of Himalayan pink salt and lemon to your water or sip fresh tender coconut water (*Elaneer*).`;
  }

  // Fallback intelligent responder with tailored advice
  return `### 💡 FitTrack Assistant Insights

Thank you for your question! Here is personalized guidance based on your profile:

- **Target:** Maintain balanced nutrition and steady progressive workouts.
- **Daily Calorie Target:** ${user.dailyCalorieTarget || 2000} kcal.
- **Key Principle:** Consistency beats perfection. Focus on quality sleep, adequate protein (1.6g/kg), and progressive resistance training.

*Tip: Feel free to ask about specific problems like "Why does my knee hurt when squatting?", "Skinny fat what to do", "Is creatine safe?", or "Can I eat white rice at night?"*`;
}

module.exports = {
  DOUBT_RESOLVERS,
  solveFitnessDoubt,
};
