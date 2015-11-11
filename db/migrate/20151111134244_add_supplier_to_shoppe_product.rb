class AddSupplierToShoppeProduct < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :supplier_id, :integer, default: nil
  end
end
