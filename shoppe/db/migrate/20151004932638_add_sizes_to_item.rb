class AddSizesToItem < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :width, :integer, default: 80
    add_column :shoppe_products, :height, :integer, default: 80
  end
end
