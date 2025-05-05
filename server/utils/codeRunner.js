import axios from 'axios';

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'judge0-ce.p.rapidapi.com';

// Language ID mapping for Judge0 API
const LANGUAGE_IDS = {
  python: 71,    // Python (3.8.1)
  csharp: 51,    // C# (Mono 6.6.0.161)
  haskell: 21,   // Haskell (GHC 8.8.1)
  lisp: 55       // Common Lisp (SBCL 2.0.0)
};

export async function runCode(language, code) {
  if (!LANGUAGE_IDS[language.toLowerCase()]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  try {
    // Create submission
    const submission = await axios.post(`${JUDGE0_API}/submissions`, {
      source_code: code,
      language_id: LANGUAGE_IDS[language.toLowerCase()],
      stdin: ''
    }, {
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    const token = submission.data.token;

    // Wait for result (poll every 1 second)
    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      result = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      });

      if (result.data.status.id !== 1 && result.data.status.id !== 2) {
        break;
      }
    }

    // Check for compilation/runtime errors
    if (result.data.status.id !== 3) {
      throw new Error(result.data.compile_output || result.data.stderr || 'Execution failed');
    }

    return result.data.stdout || '';
  } catch (error) {
    throw new Error(`Code execution failed: ${error.message}`);
  }
}