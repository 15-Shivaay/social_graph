require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/socialgraph';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({});

  const avatarBase = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

  const people = [
    { name: 'Alice Chen', email: 'alice@graph.io', bio: 'Graph theorist & coffee addict', avatar: avatarBase + 'alice' },
    { name: 'Bob Kumar', email: 'bob@graph.io', bio: 'Backend engineer, loves BFS', avatar: avatarBase + 'bob' },
    { name: 'Carol Smith', email: 'carol@graph.io', bio: 'Frontend dev & D3.js enthusiast', avatar: avatarBase + 'carol' },
    { name: 'Dave Park', email: 'dave@graph.io', bio: 'Data scientist', avatar: avatarBase + 'dave' },
    { name: 'Eve Johnson', email: 'eve@graph.io', bio: 'Security researcher', avatar: avatarBase + 'eve' },
    { name: 'Frank Lee', email: 'frank@graph.io', bio: 'DevOps & cloud architecture', avatar: avatarBase + 'frank' },
    { name: 'Grace Wang', email: 'grace@graph.io', bio: 'ML engineer', avatar: avatarBase + 'grace' },
    { name: 'Hank Torres', email: 'hank@graph.io', bio: 'Mobile developer', avatar: avatarBase + 'hank' },
    { name: 'Ivy Patel', email: 'ivy@graph.io', bio: 'Product manager', avatar: avatarBase + 'ivy' },
    { name: 'Jack Nguyen', email: 'jack@graph.io', bio: 'Startup founder', avatar: avatarBase + 'jack' },
    { name: 'Karen Liu', email: 'karen@graph.io', bio: 'UX researcher', avatar: avatarBase + 'karen' },
    { name: 'Leo Martinez', email: 'leo@graph.io', bio: 'Blockchain developer', avatar: avatarBase + 'leo' }
  ];

  const users = await User.insertMany(people);
  const ids = users.map(u => u._id);

  // Build a realistic social graph
  const edges = [
    [0,1],[0,2],[0,3],[1,2],[1,4],[2,5],[3,6],[4,7],[5,8],[6,9],[7,10],
    [8,11],[9,10],[10,11],[3,4],[5,6],[1,6],[2,7],[4,9],[0,9],[11,0]
  ];

  for (const [a, b] of edges) {
    await User.findByIdAndUpdate(ids[a], { $addToSet: { friends: ids[b] } });
    await User.findByIdAndUpdate(ids[b], { $addToSet: { friends: ids[a] } });
  }

  console.log(`✅ Seeded ${users.length} users with ${edges.length} friendships`);
  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
