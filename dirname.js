import { dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const dir_name = dirname(__filename);
export default dir_name;