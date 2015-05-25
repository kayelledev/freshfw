class CreateIncludedProducts < ActiveRecord::Migration
  def change
    create_table :shoppe_included_products do |t|
      t.references :parent_product
      t.references :included_product
    end
  end
end
