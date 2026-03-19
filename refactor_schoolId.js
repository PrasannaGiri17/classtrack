const fs = require('fs');
const path = require('path');

const BACKEND_MODELS_DIR = path.join(__dirname, 'Backend', 'models');
const BACKEND_CONTROLLERS_DIR = path.join(__dirname, 'Backend', 'controllers');
const FRONTEND_PAGES_DIR = path.join(__dirname, 'frontend', 'src', 'Adminpages');
const FRONTEND_COMPONENTS_DIR = path.join(__dirname, 'frontend', 'src', 'AdminComponents');

// 1. Update Models
function updateModels() {
    const files = fs.readdirSync(BACKEND_MODELS_DIR);
    for (const file of files) {
        if (!file.endsWith('.js')) continue;
        const filePath = path.join(BACKEND_MODELS_DIR, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        // Check if schoolId exists
        if (!content.includes('schoolId:') && !content.includes('schoolId :')) {
            // Find the first schema definition and inject schoolId
            content = content.replace(/new mongoose\.Schema\(\s*\{/, "new mongoose.Schema({\n  schoolId: { type: Number, required: true, index: true },");
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Updated model: ${file}`);
        } else if (!content.includes('index: true')) {
            // Add index: true to schoolId if it exists but no index
            content = content.replace(/schoolId:\s*\{\s*type:\s*Number,\s*required:\s*true\s*}/g, "schoolId: { type: Number, required: true, index: true }");
            fs.writeFileSync(filePath, content, 'utf-8');
        }
    }
}

// 2. Update Controllers
function updateControllers() {
    const files = fs.readdirSync(BACKEND_CONTROLLERS_DIR);
    for (const file of files) {
        if (!file.endsWith('.js')) continue;
        // Don't auto-update schoolController or userAuthController with blind regex to avoid breaking auth
        if (file === 'schoolController.js' || file === 'userAuthController.js') continue;

        const filePath = path.join(BACKEND_CONTROLLERS_DIR, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        // Replace .find() -> .find({ schoolId: req.schoolId })
        // Use a regex that catches Model.find() or Model.find({})
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.find\(\s*\)/g, "$1.find({ schoolId: req.schoolId })");
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.find\(\s*\{\s*\}\s*\)/g, "$1.find({ schoolId: req.schoolId })");

        // For find that already has conditions, e.g., Model.find({ status: 'active' })
        // This is trickier with regex. We look for Model.find({ and insert schoolId: req.schoolId,
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.find\(\s*\{(?!\s*schoolId)/g, "$1.find({ schoolId: req.schoolId, ");

        // findOne
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.findOne\(\s*\)/g, "$1.findOne({ schoolId: req.schoolId })");
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.findOne\(\s*\{(?!\s*schoolId)/g, "$1.findOne({ schoolId: req.schoolId, ");

        // countDocuments
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.countDocuments\(\s*\)/g, "$1.countDocuments({ schoolId: req.schoolId })");
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.countDocuments\(\s*\{(?!\s*schoolId)/g, "$1.countDocuments({ schoolId: req.schoolId, ");

        // findByIdAndUpdate is harder using regex since it uses string ID.
        // Instead of findByIdAndUpdate(id, data), use findOneAndUpdate({ _id: id, schoolId: req.schoolId }, data)
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.findByIdAndUpdate\(\s*req\.params\.id\s*,/g, "$1.findOneAndUpdate({ _id: req.params.id, schoolId: req.schoolId },");
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.findByIdAndUpdate\(\s*([a-zA-Z0-9_]+)\s*,/g, "$1.findOneAndUpdate({ _id: $2, schoolId: req.schoolId },");

        // findByIdAndDelete
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.findByIdAndDelete\(\s*req\.params\.id\s*\)/g, "$1.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId })");
        content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.findByIdAndDelete\(\s*([a-zA-Z0-9_]+)\s*\)/g, "$1.findOneAndDelete({ _id: $2, schoolId: req.schoolId })");


        if (content !== fs.readFileSync(filePath, 'utf-8')) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Updated controller: ${file}`);
        }
    }
}

// 3. Update Frontend Files manually using basic regex for safety
function walkSync(dir, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            filelist = walkSync(dir + '/' + file, filelist);
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                filelist.push(dir + '/' + file);
            }
        }
    });
    return filelist;
}

function updateFrontend() {
    let allFiles = [];
    if (fs.existsSync(FRONTEND_PAGES_DIR)) allFiles = allFiles.concat(walkSync(FRONTEND_PAGES_DIR));
    if (fs.existsSync(FRONTEND_COMPONENTS_DIR)) allFiles = allFiles.concat(walkSync(FRONTEND_COMPONENTS_DIR));

    for (const filePath of allFiles) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let originalContent = content;

        // Auto replace basic axios to include schoolId
        // This is a rough heuristic. We'll add better interceptor logic but the instruct said to add ?schoolId=${user.schoolId}
        // Let's replace axios.get(`...`) with axios.get(`...?schoolId=${user?.schoolId}`)
        // But some URLs already have ?, so we might append &schoolId.
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Updated frontend component: ${filePath}`);
        }
    }
}

updateModels();
updateControllers();
// updateFrontend();
console.log("Refactoring script completed step 1.");
