import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as acorn from 'acorn';
import jsx from 'acorn-jsx';
import * as walk from 'acorn-walk';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure acorn parser with JSX support
const Parser = acorn.Parser.extend(jsx());

// Define the files we want to track
const updaterFiles = [
    {
        name: 'InfoButton.jsx',
        path: 'src/components/InfoButton.jsx',
        type: 'jsx'
    },
    {
        name: 'package.json',
        path: 'package.json',
        type: 'json'
    },
    {
        name: 'Cargo.toml',
        path: 'src-tauri/Cargo.toml',
        type: 'toml'
    },
    {
        name: 'tauri.conf.json',
        path: 'src-tauri/tauri.conf.json',
        type: 'json'
    },
    {
        name: 'latest.json',
        path: 'latest.json',
        type: 'json'
    },
    {
        name: 'capabilities/default.json',
        path: 'src-tauri/capabilities/default.json',
        type: 'json'
    }
];

function extractMethodsAndCode(filePath, fileType) {
    let methods = [];
    let codeContent = '';

    try {
        codeContent = fs.readFileSync(filePath, 'utf-8');

        if (fileType === 'jsx' || fileType === 'js') {
            try {
                const ast = Parser.parse(codeContent, { 
                    ecmaVersion: 'latest', 
                    sourceType: 'module'
                });
                
                // Extract function names
                walk.simple(ast, {
                    FunctionDeclaration(node) {
                        if (node.id && node.id.name) {
                            methods.push(node.id.name);
                        }
                    },
                    VariableDeclarator(node) {
                        if (node.id && node.id.name && node.init && 
                            (node.init.type === 'ArrowFunctionExpression' || 
                             node.init.type === 'FunctionExpression')) {
                            methods.push(node.id.name);
                        }
                    }
                });
            } catch (error) {
                console.error(`Error parsing ${filePath}:`, error);
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File not found: ${filePath} - This is expected for optional files.`);
        } else {
            console.error(`Error reading ${filePath}:`, error);
        }
        codeContent = `Error: Could not read file ${filePath}`;
    }

    return { methods, codeContent };
}

function getUpdaterFilesData(baseDirectory) {
    let updaterData = {
        timestamp: new Date().toISOString(),
        files: {}
    };

    updaterFiles.forEach(file => {
        const filePath = path.join(baseDirectory, file.path);
        const { methods, codeContent } = extractMethodsAndCode(filePath, file.type);

        updaterData.files[file.path] = {
            filename: file.name,
            filepath: file.path,
            type: file.type,
            methods: methods,
            code: codeContent
        };
    });

    return updaterData;
}

function saveUpdaterData(directory) {
    const updaterData = getUpdaterFilesData(directory);
    const jsonFilePath = path.join(directory, 'updater-files.json');

    fs.writeFileSync(jsonFilePath, JSON.stringify(updaterData, null, 2));
    console.log(`Updater files data saved to ${jsonFilePath}`);
}

// Execute the function
saveUpdaterData(__dirname); 