class AddPositionsToItemAddRoom < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :posX, :integer, default: 0 unless ActiveRecord::Base.connection.column_exists?(:shoppe_products, :posX)
    add_column :shoppe_products, :posY, :integer, default: 0 unless ActiveRecord::Base.connection.column_exists?(:shoppe_products, :posY)
  end
end
