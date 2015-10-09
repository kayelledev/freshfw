class AddPositionsToItemAddRoom < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :posX, :integer, default: 0
    add_column :shoppe_products, :posY, :integer, default: 0
  end
end
