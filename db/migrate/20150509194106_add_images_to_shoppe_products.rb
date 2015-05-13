class AddImagesToShoppeProducts < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :default_image, :string
    add_column :shoppe_products, :image2, :string
    add_column :shoppe_products, :image3, :string
    add_column :shoppe_products, :image4, :string
    add_column :shoppe_products, :image5, :string
    add_column :shoppe_products, :image6, :string 
  end
end
