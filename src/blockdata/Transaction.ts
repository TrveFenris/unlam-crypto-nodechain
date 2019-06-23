export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
}

export interface ImageTransaction {
  sender: string;
  recipient: string;
  image: string; // base64,
}

/*
impl ImageTransaction {
    pub fn new(s: String, r: String, image_path: String) -> ImageTransaction {
        ImageTransaction {
            sender: s,
            recipient: r,
            img: Some(image::open(image_path).unwrap().to_rgba()),
        }
    }
    fn save_image_to_file(&self, path: String) {
        match &self.img {
            None => None,
            Some(i) => Some(i.save(path).ok().expect("Saving image failed")),
        };
    }
}
*/
