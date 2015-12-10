class CreateMaterials < ActiveRecord::Migration
  def change
    create_table :shoppe_materials do |t|
      t.string :name
      t.timestamps null: false
    end
    add_column :shoppe_products, :material_id, :integer, default: nil

    Shoppe::ProductAttribute.where(key: "Technical Description").each do |attribute|
      material_id = Shoppe::Material.where(name: attribute.value).first_or_create.id
      attribute.product.update(material_id: material_id) if attribute.product.present?
      attribute.destroy
    end
  end
end
