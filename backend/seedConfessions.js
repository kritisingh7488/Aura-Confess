require('dotenv').config();
const mongoose = require('mongoose');
const Confession = require('./models/Confession');
const User = require('./models/User');
const crypto = require('crypto');

const confessionsData = [
  {
    text: "I've been secretly learning guitar for 6 months to surprise my best friend with a song on their birthday. I practice at 5 AM every day so no one hears me.",
    category: 'friendship',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "I accidentally sent a love letter to my crush's mom instead of them. She thinks it's the sweetest thing and keeps encouraging her daughter to date me. I can't tell anyone the truth.",
    category: 'love',
    burnAfter24Hours: false,
    poll: {
      question: "Should I confess the mix-up?",
      options: [
        { text: "Yes, honesty is best", votes: [] },
        { text: "No, keep the secret", votes: [] },
        { text: "Tell the mom first", votes: [] }
      ],
      isActive: true
    }
  },
  {
    text: "My boss thinks I'm working remotely from home, but I've actually been traveling across Europe for the past 3 months. As long as the work gets done, right?",
    category: 'work',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "I pretended to be sick for a week just to binge-watch an entire TV series. Now everyone thinks I have some mysterious illness and won't stop asking if I'm okay.",
    category: 'secrets',
    burnAfter24Hours: true,
    poll: null
  },
  {
    text: "I've been buying my family's favorite cookies from the bakery and putting them in homemade cookie containers. They think I'm an amazing baker. It's been 2 years.",
    category: 'family',
    burnAfter24Hours: false,
    poll: {
      question: "How long can this secret last?",
      options: [
        { text: "Forever if you're careful", votes: [] },
        { text: "They'll find out eventually", votes: [] }
      ],
      isActive: true
    }
  },
  {
    text: "I failed my driver's test 5 times but told everyone I passed on the first try. I take Uber everywhere and park a few blocks away when visiting people.",
    category: 'regrets',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "My dream is to quit my corporate job and open a cat café. I've been saving money secretly for 3 years. My partner thinks I'm saving for a house.",
    category: 'dreams',
    burnAfter24Hours: false,
    poll: {
      question: "Should I tell my partner about my real dream?",
      options: [
        { text: "Tell them now", votes: [] },
        { text: "Wait until you have more saved", votes: [] },
        { text: "Just do it and surprise them", votes: [] },
        { text: "Compromise and discuss together", votes: [] }
      ],
      isActive: true
    }
  },
  {
    text: "I've been attending my neighbor's family dinners for 6 months. They think I'm a distant cousin visiting from another state. The food is too good to come clean.",
    category: 'other',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "I 'borrowed' my roommate's gaming account and accidentally spent $500 on in-game items. I've been slowly replacing the money by doing their chores.",
    category: 'regrets',
    burnAfter24Hours: true,
    poll: null
  },
  {
    text: "Every time my professor asks a question I don't know, I fake a coughing fit and leave the room. I've done this 12 times this semester. They offered me cough drops last week.",
    category: 'school',
    burnAfter24Hours: false,
    poll: {
      question: "What should I do?",
      options: [
        { text: "Come clean to the professor", votes: [] },
        { text: "Actually study more", votes: [] },
        { text: "Get real cough drops as prop", votes: [] }
      ],
      isActive: true
    }
  },
  {
    text: "I told my parents I'm studying abroad, but I'm actually just staying at a friend's apartment in the same city taking online classes. I needed space but didn't want to hurt their feelings.",
    category: 'family',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "I've been in love with my best friend's sibling for 5 years. Every family gathering is torture. I'm moving to another city next month because I can't handle it anymore.",
    category: 'love',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "My coworkers think I'm some kind of productivity genius. Truth is, I automated most of my tasks with a simple script and spend 5 hours a day learning to code instead of working.",
    category: 'work',
    burnAfter24Hours: false,
    poll: {
      question: "Is this wrong if the work is done?",
      options: [
        { text: "No, working smarter not harder", votes: [] },
        { text: "Yes, you're being dishonest", votes: [] }
      ],
      isActive: true
    }
  },
  {
    text: "I accidentally ruined my sister's wedding dress the night before her wedding. I drove 200 miles at midnight to find an identical one. She never knew. That was 10 years ago and I still have nightmares.",
    category: 'secrets',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "I ghosted my entire friend group 2 years ago because I was too anxious to tell them I was depressed. Now I'm better but too embarrassed to reach out. I miss them every day.",
    category: 'regrets',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "My dream journal is actually full of fictional stories I write. When my therapist asks about my dreams, I just read from it. She thinks I have the most fascinating subconscious mind.",
    category: 'dreams',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "I'm a vegetarian at home but secretly eat meat when I'm out. My family has been vegetarian for generations and would be devastated if they knew.",
    category: 'family',
    burnAfter24Hours: true,
    poll: {
      question: "Should I come clean?",
      options: [
        { text: "Yes, be honest", votes: [] },
        { text: "No, it's your choice", votes: [] },
        { text: "Gradually introduce the topic", votes: [] }
      ],
      isActive: true
    }
  },
  {
    text: "I can't ride a bike. I'm 28 years old and whenever someone suggests a bike ride, I make up elaborate excuses. I even faked a knee injury once.",
    category: 'other',
    burnAfter24Hours: false,
    poll: null
  },
  {
    text: "I've been wearing the same 'lucky' socks to every exam for 4 years. They're so old they're more hole than sock. My roommate tried to throw them away once and I had a full meltdown.",
    category: 'school',
    burnAfter24Hours: false,
    poll: {
      question: "Is my superstition too much?",
      options: [
        { text: "Yes, just buy new lucky socks", votes: [] },
        { text: "No, whatever works!", votes: [] }
      ],
      isActive: true
    }
  },
  {
    text: "My partner proposed to me 6 months ago and I said yes, but I've been having second thoughts. I haven't told anyone, not even my therapist. The wedding is in 3 months.",
    category: 'love',
    burnAfter24Hours: false,
    poll: null
  }
];

async function seedConfessions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Get first user to be the author
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please create a user first by logging in via Google OAuth.');
      process.exit(1);
    }

    console.log(`📝 Found user: ${user.displayName}`);
    console.log('🌱 Seeding confessions...');

    // Clear existing confessions (optional)
    // await Confession.deleteMany({});
    // console.log('Cleared existing confessions');

    const createdConfessions = [];

    for (let i = 0; i < confessionsData.length; i++) {
      const data = confessionsData[i];
      
      const confessionData = {
        text: data.text,
        category: data.category,
        author: user._id,
        isDraft: false,
        secretCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
        reactions: {
          fire: [],
          heart: [],
          laugh: [],
          sad: [],
          shocked: []
        }
      };

      // Add burn time if specified
      if (data.burnAfter24Hours) {
        confessionData.burnAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      // Add poll if it exists
      if (data.poll) {
        confessionData.poll = data.poll;
      }

      const confession = await Confession.create(confessionData);
      createdConfessions.push(confession);
      console.log(`✅ Created confession ${i + 1}/20: ${data.category}`);
    }

    console.log(`\n🎉 Successfully seeded ${createdConfessions.length} confessions!`);
    console.log('\nConfession categories:');
    const categoryCounts = {};
    createdConfessions.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });
    console.table(categoryCounts);

    mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding confessions:', error);
    process.exit(1);
  }
}

seedConfessions();
