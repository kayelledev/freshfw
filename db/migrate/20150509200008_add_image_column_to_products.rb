class AddImageColumnToProducts < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :image, :string
  end
end
