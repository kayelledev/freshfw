class CreateColors < ActiveRecord::Migration
  def change
    create_table :shoppe_colors do |t|
      t.string :name
      t.timestamps null: false
    end
    add_column :shoppe_products, :color_id, :integer, default: nil

    Shoppe::ProductAttribute.where(key: "Color").each do |attribute|
      color_id = Shoppe::Color.where(name: attribute.value).first_or_create.id
      attribute.product.update(color_id: color_id) if attribute.product.present?
      attribute.destroy
    end
  end
end
