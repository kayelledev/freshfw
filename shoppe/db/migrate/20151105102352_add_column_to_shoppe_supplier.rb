class AddColumnToShoppeSupplier < ActiveRecord::Migration
  def change
    add_column :shoppe_suppliers, :name, :string
  end
end
