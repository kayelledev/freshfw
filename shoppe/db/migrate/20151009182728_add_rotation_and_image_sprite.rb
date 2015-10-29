class AddRotationAndImageSprite < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :rotation, :integer, default: 0 unless ActiveRecord::Base.connection.column_exists?(:shoppe_products, :rotation)
  end
end
