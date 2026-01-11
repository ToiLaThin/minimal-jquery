import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
    const isProduction = argv.mode == 'production';

    return {
        entry: './src/core.js',
        mode: isProduction ? "production" : "development",
        devtool: "source-map",
        optimization: {
            minimize: isProduction
        },
        output: {
            filename: isProduction ? 'main.min.js' : 'main.js',
            path: path.resolve(__dirname, 'dist')
        },
    };
}