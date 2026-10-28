import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

interface CharacterData {
  guild: string,
  name: string,
  level: number,
  gender: 'male' | 'female',
  job: string,
  exp: string,
  quests: number,
  cards: number,
  donor: boolean,
  fame: number
}

const ALLOWED_ORIGIN = 'https://leech-calculator-mirror.vercel.app';
const VALID_NAME = /^[A-Za-z0-9]{1,16}$/;

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  // Only the mirror site may use this proxy
  res.setHeader('Vary', 'Origin');
  if (req.headers.origin !== ALLOWED_ORIGIN) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { name } = req.query;

  if (typeof name !== 'string' || !name) {
    res.status(400).json({ error: 'Name parameter is required and must be a string' });
    return;
  }

  if (!VALID_NAME.test(name)) {
    res.status(400).json({ error: 'Name must be 1-16 letters or numbers' });
    return;
  }

  try {
    const apiResponse = await fetch(
      `https://legends.ml/api/character?name=${encodeURIComponent(name)}`,
    );
    
    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }
    
    const data: CharacterData = await apiResponse.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};