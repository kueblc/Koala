class CreateSources < ActiveRecord::Migration
  def self.up
    create_table :sources do |t|
      t.string :name
      t.text :source_code
      t.text :contributions
      t.integer :project_id
      t.datetime :creation_time
      t.datetime :modified_time
      
      t.timestamps
    end
  end

  def self.down
    drop_table :sources
  end
end
