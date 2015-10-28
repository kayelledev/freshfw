class AddCurrencyToShoppeOrders < ActiveRecord::Migration
  def change
    add_column :shoppe_orders, :currency, :string, default: 'ca'
  end
end
