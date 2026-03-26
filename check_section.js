const mongoose = require('mongoose'); 
(async () => { 
  try { 
    await mongoose.connect('mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0'); 
    const db = mongoose.connection.db; 
    const coll = db.collection('students');
    const count = await coll.countDocuments({ sectionId: { $ne: null }, schoolId: 3 }); 
    console.log('Students with sectionId schoolId 3:', count); 
    const all = await coll.countDocuments({ schoolId: 3 });
    console.log('Total students in school 3:', all);
    process.exit(0); 
  } catch (e) { 
    console.error(e); 
    process.exit(1); 
  } 
})();
