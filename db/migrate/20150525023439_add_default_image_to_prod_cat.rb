class AddDefaultImageToProdCat < ActiveRecord::Migration
  def change
    add_column :shoppe_product_categories, :default_image, :string
  end
end
