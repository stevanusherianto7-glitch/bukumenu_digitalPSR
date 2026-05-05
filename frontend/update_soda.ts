import { supabase } from './src/lib/supabase';

async function updateSodaImage() {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ image_url: '/images/aneka_soda_real.png' })
      .eq('name', 'Aneka Soda');

    if (error) {
      console.error('Error updating Supabase:', error);
    } else {
      console.log('Successfully updated Aneka Soda image in Supabase with the real photo!');
    }
  } catch (err) {
    console.error(err);
  }
}

updateSodaImage();
