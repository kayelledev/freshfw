class AddTaxToOrders < ActiveRecord::Migration
  def change
    add_column :shoppe_orders, :tax, :decimal, precision: 5, scale: 2
  end
end
