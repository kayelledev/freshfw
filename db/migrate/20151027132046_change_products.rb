class ChangeProducts < ActiveRecord::Migration

  def up
	change_table :shoppe_products do |t|
	  t.change :height, :float
	  t.change :width, :float
	  t.change :depth, :float
	end
  end

  def down
	change_table :shoppe_products do |t|
	  t.change :height, :integer
	  t.change :width, :integer
	  t.change :depth, :integer
	end
  end

end
