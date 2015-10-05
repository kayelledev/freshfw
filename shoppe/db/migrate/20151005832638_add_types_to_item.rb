class AddTypesToItem < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :is_preset, :boolean, default: false
  end
end
