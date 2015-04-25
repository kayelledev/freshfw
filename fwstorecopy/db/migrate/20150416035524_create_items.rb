class CreateItems < ActiveRecord::Migration
  def change
    create_table :items do |t|
      t.string  :item_sku, :item_name, :item_type, :item_description, :item_dimensions, :item_materials, :item_Photo_1, :item_Photo_2, :item_Photo_3, :item_Photo_4
      t.timestamps
    end
  end
end
