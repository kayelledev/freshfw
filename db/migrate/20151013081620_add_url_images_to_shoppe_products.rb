class AddUrlImagesToShoppeProducts < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :url_default_image, :string
    add_column :shoppe_products, :url_image2, :string
    add_column :shoppe_products, :url_image3, :string
    add_column :shoppe_products, :url_image4, :string
    add_column :shoppe_products, :url_image5, :string
    add_column :shoppe_products, :url_image6, :string
  end
end
