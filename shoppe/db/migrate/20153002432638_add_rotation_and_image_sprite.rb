class AddRotationAndImageSprite < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :rotation, :integer, default: 0
  end
end
