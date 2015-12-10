class ReplaceRelationBetweenProductAndMaterialAndColor < ActiveRecord::Migration
  def change
    create_table :shoppe_products_colors do |t|
      t.references :product, index: true
      t.references :color, index: true
      t.timestamps null: false
    end
    add_index :shoppe_products_colors, [:product_id, :color_id], :unique => true, :name => 'shoppe_products_colors_index'
    create_table :shoppe_products_materials do |t|
      t.references :product, index: true
      t.references :material, index: true
      t.timestamps null: false
    end
    add_index :shoppe_products_materials, [:product_id, :material_id], :unique => true, :name => 'shoppe_products_materials_index'

    Color.all.each do |color|
      color.name.split(",").each do |color_name|
      	color_element = Color.where(name: color_name.strip).first_or_create
      	Product.where(color_id: color.id).each{ |product| product.colors << color_element }
      end
    end
    Material.all.each do |material|
      material.name.split(",").each do |material_name|
      	material_element = Material.where(name: material_name.strip).first_or_create
      	Product.where(material_id: material.id).each{ |product| product.materials << material_element }
      end
    end
    Color.all.each do |color|
      color.destroy if color.name.split(",").count > 1
    end
    Material.all.each do |material|
      material.destroy if material.name.split(",").count > 1
    end
  	remove_column :shoppe_products, :material_id
  	remove_column :shoppe_products, :color_id
  end
end
