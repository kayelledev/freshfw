class ChangeIncludedToInteger < ActiveRecord::Migration
  def change
    change_column :shoppe_products, :included, :string, array: true, :default = {}
  end
end
