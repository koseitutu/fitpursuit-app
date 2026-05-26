export const WEEKLY_ROUTINE = {
  Monday: {
    title: "Chest & Triceps",
    type: "Push Day",
    exercises: [
      { id: "m1", name: "Chest Press", sets: 4, reps: "10-12", station: "Main Press Arms", steps: "1. Sit firmly back. Adjust seat so horizontal handles align with mid-chest.\n2. Grasp with overhand grip, feet flat, brace core.\n3. Push straight out without locking elbows.\n4. Slowly lower back until a comfortable chest stretch is achieved." },
      { id: "m2", name: "Pec Fly", sets: 3, reps: "12-15", station: "Fly Arms / Curved Pads", steps: "1. Adjust handles back. Sit with back flush to pad.\n2. Grasp vertical handles, slight bend in elbows.\n3. Sweep arms forward in a wide arc until handles meet.\n4. Squeeze for 1s, then slowly open back out." },
      { id: "m3", name: "Seated Tricep Overhead Extension", sets: 3, reps: "10-12", station: "Low Pulley + Short Bar", steps: "1. Attach short bar to low pulley. Sit facing away from stack.\n2. Bring cable up behind back, hands overhead, elbows pointing up.\n3. Keep upper arms locked close to ears. Lower forearms behind head.\n4. Extend hands straight up toward ceiling." },
      { id: "m4", name: "Tricep Pushdowns", sets: 3, reps: "12-15", station: "High Pulley + Lat Bar", steps: "1. Stand facing machine. Grasp high bar overhand at shoulder width.\n2. Pin elbows securely to ribcage.\n3. Push bar straight down to thighs by straightening arms.\n4. Squeeze triceps, return slowly to chest level." }
    ]
  },
  Tuesday: {
    title: "Back & Biceps",
    type: "Pull Day",
    exercises: [
      { id: "t1", name: "Wide-Grip Lat Pulldown", sets: 4, reps: "10-12", station: "High Pulley + Orange Bar", steps: "1. Sit facing machine, lock thighs under upper rollers.\n2. Grip wide, angled ends of orange bar overhand.\n3. Lean back slightly, drive elbows down to back pockets.\n4. Touch upper chest, pause, control bar back up." },
      { id: "t2", name: "Seated Low Row", sets: 4, reps: "10-12", station: "Low Pulley + Row Handle", steps: "1. Sit facing machine, brace feet firmly against framework.\n2. Tall posture, neutral spine. Grab handles with extended arms.\n3. Pull directly toward lower belly button, elbows tucked.\n4. Squeeze shoulder blades, slowly extend arms out." },
      { id: "t3", name: "Straight-Arm Pulldown", sets: 3, reps: "12", station: "High Pulley + Orange Bar", steps: "1. Stand facing machine, step back to create cable tension.\n2. Grasp bar shoulder-width. Hinge slightly at hips, flat back.\n3. Keeping arms almost fully straight, pull down in arc to thighs.\n4. Squeeze lower lats, control back to eye level." },
      { id: "t4", name: "Cable Bicep Curls", sets: 4, reps: "12", station: "Low Pulley + Short Bar", steps: "1. Stand close to machine facing stack. Grip bar underhand.\n2. Lock elbows tight against side waist.\n3. Curl bar upward toward shoulders without moving upper arms.\n4. Squeeze peak, lower slowly to full extension." }
    ]
  },
  Wednesday: {
    title: "Legs & Core",
    type: "Lower Body",
    exercises: [
      { id: "w1", name: "Seated Leg Press", sets: 4, reps: "12-15", station: "Footplate Assembly", steps: "1. Sit squarely, feet flat on black footplate shoulder-width.\n2. Ensure knees are at a 90-degree angle. Hold side handles.\n3. Drive through heels to push plate away (do not lock knees).\n4. Slowly lower back down to 90-degree start." },
      { id: "w2", name: "Leg Extensions", sets: 3, reps: "12-15", station: "Upper Foam Rollers", steps: "1. Sit back. Hook ankles under lowest padded rollers.\n2. Top rollers rest above knees. Grip side handles.\n3. Straighten legs out in front until fully horizontal.\n4. Squeeze thighs for 1s, lower under control." },
      { id: "w3", name: "Seated Leg Curls", sets: 3, reps: "12", station: "Lower Foam Rollers", steps: "1. Sit on bench, back of lower calves resting on roller pads.\n2. Secure hips firmly back into the seat.\n3. Pull heels down and backward under seat frame.\n4. Squeeze hamstrings, return slowly to straight." },
      { id: "w4", name: "Cable Crunch", sets: 3, reps: "15-20", station: "High Pulley + Rope", steps: "1. Kneel facing machine. Hold rope attachment next to ears.\n2. Lock hips in place (do not sit back on heels).\n3. Flex abs to curl spine, moving elbows to thighs.\n4. Squeeze abdominal wall, return slowly to upright." }
    ]
  },
  Thursday: {
    title: "Shoulders & Upper Traps",
    type: "Push/Pull Mix",
    exercises: [
      { id: "th1", name: "Seated Shoulder Press", sets: 4, reps: "10-12", station: "Main Press Arms (Modified)", steps: "1. Sit tall, scoot hips forward slightly to create upward angle.\n2. Grab horizontal chest press handles overhand.\n3. Press upward and away until arms are extended.\n4. Lower back down to chin height under tension." },
      { id: "th2", name: "Cable Lateral Raises", sets: 3, reps: "12-15", station: "Low Pulley + Single Handle", steps: "1. Stand sideways to low pulley.\n2. Reach across body with outside hand to grab handle.\n3. Raise arm out to side until parallel to ground (T-shape).\n4. Control descent across torso. Swap sides after set." },
      { id: "th3", name: "Cable Front Raises", sets: 3, reps: "12", station: "Low Pulley + Short Bar", steps: "1. Stand facing away from low pulley, cable between legs.\n2. Grasp bar overhand, arms hanging down against thighs.\n3. Keeping arms straight, raise forward to shoulder height.\n4. Pause, control descent back to thighs." },
      { id: "th4", name: "Cable Shrugs", sets: 3, reps: "15", station: "Low Pulley + Short Bar", steps: "1. Stand facing low pulley. Grasp bar overhand shoulder-width.\n2. Stand tall, arms straight down.\n3. Shrug shoulders straight up toward ears (do not bend elbows).\n4. Squeeze traps at peak for 1s, lower smoothly." }
    ]
  },
  Friday: {
    title: "Full Body Finish & Arms",
    type: "Finisher Day",
    exercises: [
      { id: "f1", name: "Seated Leg Press", sets: 3, reps: "15", station: "Footplate Assembly", steps: "Perform higher-rep burnout using identical setup from Wednesday." },
      { id: "f2", name: "Close-Grip Lat Pulldown", sets: 3, reps: "12", station: "High Pulley + Underhand Grip", steps: "1. Sit anchored under pads. Grip bar underhand shoulder-width.\n2. Pull straight down to upper chest, keeping elbows tight to sides.\n3. Focus on lower lats and biceps. Control to top stretch." },
      { id: "f3", name: "Arm Superset (Pushdown/Curl)", sets: 3, reps: "12", station: "High & Low Pulleys", steps: "1. Perform 1 set of tricep pushdowns, then immediately 1 set of cable curls.\n2. Rest 60s after both are done. Repeat for 3 total rounds." },
      { id: "f4", name: "Woodchoppers", sets: 3, reps: "15", station: "High Pulley + Single Handle", steps: "1. Stand sideways to machine, wide stance. Grab handle with both hands.\n2. Pull cable diagonally down and across torso to opposite knee.\n3. Pivot back foot, rotate core, keep arms mostly straight.\n4. Return slowly to top start point." }
    ]
  }
};