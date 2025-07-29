// You might need to adjust these imports to match your project structure!
import { supabase } from '../config/supabaseApp.js';
import { updateGymTags } from './gymController.js';

async function updateAllGymsTags() {
  const { data: gyms, error } = await supabase
    .from('gyms')
    .select('id');

  if (error) {
    console.error('Error fetching gyms:', error);
    return;
  }

  for (const gym of gyms) {
    try {
      await updateGymTags(gym.id);
      console.log(`Updated tags for gym ${gym.id}`);
    } catch (e) {
      console.error(`Failed to update tags for gym ${gym.id}:`, e);
    }
  }
}

updateAllGymsTags().then(() => {
  console.log('Finished updating all gyms!');
  process.exit(0); // Cleanly exit Node process
});
