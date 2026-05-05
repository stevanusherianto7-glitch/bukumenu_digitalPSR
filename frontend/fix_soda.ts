import { supabase } from './src/lib/supabase';

async function updateSodaImageSupabase() {
  const newUrl = 'https://zyalxogxdxeoisuwwmic.supabase.co/storage/v1/object/public/public-images/Sprite,%20Fanta,%20Coca-cola.png';
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ image_url: newUrl })
      .ilike('name', '%Sprite%');

    if (error) {
      console.error('Error updating Supabase:', error);
    } else {
      console.log('Successfully updated the image URL to the Supabase Storage link!');
    }
  } catch (err) {
    console.error(err);
  }
}

updateSodaImageSupabase();
