class AddIncludedToShoppeProducts < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :included, :integer, array: true, default: '{}'
  end
end
