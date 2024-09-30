########################### DO NOT MODIFY THIS SECTION ##########################
#################################################################################
import sqlite3
from sqlite3 import Error
import csv
#################################################################################

## Change to False to disable Sample
SHOW = False

############### SAMPLE CLASS AND SQL QUERY ###########################
######################################################################
class Sample():
    def sample(self):
        try:
            connection = sqlite3.connect("sample")
            connection.text_factory = str
        except Error as e:
            print("Error occurred: " + str(e))
        print('\033[32m' + "Sample: " + '\033[m')
        
        # Sample Drop table
        connection.execute("DROP TABLE IF EXISTS sample;")
        # Sample Create
        connection.execute("CREATE TABLE sample(id integer, name text);")
        # Sample Insert
        connection.execute("INSERT INTO sample VALUES (?,?)",("1","test_name"))
        connection.commit()
        # Sample Select
        cursor = connection.execute("SELECT * FROM sample;")
        print(cursor.fetchall())

######################################################################

class HW2_sql():
    ############### DO NOT MODIFY THIS SECTION ###########################
    ######################################################################
    def create_connection(self, path):
        connection = None
        try:
            connection = sqlite3.connect(path)
            connection.text_factory = str
        except Error as e:
            print("Error occurred: " + str(e))
    
        return connection

    def execute_query(self, connection, query):
        cursor = connection.cursor()
        try:
            if query == "":
                return "Query Blank"
            else:
                cursor.execute(query)
                connection.commit()
                return "Query executed successfully"
        except Error as e:
            return "Error occurred: " + str(e)
    ######################################################################
    ######################################################################

    # GTusername [0 points]
    def GTusername(self):
        gt_username = "rma86"
        return gt_username
    
    # Part 1.a.i Create Tables [2 points]
    def part_1_a_i(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_1_a_i_sql = """CREATE TABLE movies (
        id INTEGER,
        title TEXT,
        score REAL
        );"""
        ######################################################################
        
        return self.execute_query(connection, part_1_a_i_sql)

    def part_1_a_ii(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_1_a_ii_sql = """CREATE TABLE movie_cast (
        movie_id INTEGER,
        cast_id INTEGER,
        cast_name TEXT,
        birthday TEXT,
        popularity REAL
        );"""
        ######################################################################
        
        return self.execute_query(connection, part_1_a_ii_sql)
    
    # Helper function that makes sure each value in a line is parsed into the right type
    def parse_csv_line(self, line: list)->list:
        values = []
        for value in line:
            if value.replace('.', '', 1).isdigit():  # Cheks for integers and reals
                values.append(value)
            else:
                value = value.replace("'", "''")
                values.append(f"'{value}'") 
        return ", ".join(values)
    
    # Part 1.b Import Data [2 points]
    def part_1_b_movies(self,connection,path):
        ############### CREATE IMPORT CODE BELOW ############################
        with open(path, mode='r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)
            for i, line in enumerate(csv_reader):
                command = f"INSERT INTO movies VALUES({self.parse_csv_line(line)});"
                msg =  self.execute_query(connection, command)
                if msg != "Query executed successfully":
                    print(i, msg)
       ######################################################################
        
        sql = "SELECT COUNT(id) FROM movies;"
        cursor = connection.execute(sql)
        return cursor.fetchall()[0][0]
    
    def part_1_b_movie_cast(self,connection, path):
        ############### CREATE IMPORT CODE BELOW ############################
        with open(path, mode='r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)
            for i, line in enumerate(csv_reader):
                command = f"INSERT INTO movie_cast VALUES({self.parse_csv_line(line)});"
                msg =  self.execute_query(connection, command)
                if msg != "Query executed successfully":
                    print(i, msg)
        ######################################################################
        
        sql = "SELECT COUNT(cast_id) FROM movie_cast;"
        cursor = connection.execute(sql)
        return cursor.fetchall()[0][0]

    # Part 1.c Vertical Database Partitioning [5 points]
    def part_1_c(self,connection):
        ############### EDIT CREATE TABLE SQL STATEMENT ###################################
        part_1_c_sql = """CREATE TABLE cast_bio (
        cast_id INTEGER PRIMARY KEY,
        cast_name TEXT,
        birthday TEXT,
        popularity REAL
        );"""
        ######################################################################
        
        self.execute_query(connection, part_1_c_sql)
        
        ############### CREATE IMPORT CODE BELOW ############################
        part_1_c_insert_sql = """INSERT OR IGNORE INTO cast_bio (cast_id, cast_name, birthday, popularity)
        select cast_id, cast_name, birthday, popularity from movie_cast;"""
        ######################################################################
        
        self.execute_query(connection, part_1_c_insert_sql)
        
        sql = "SELECT COUNT(cast_id) FROM cast_bio;"
        cursor = connection.execute(sql)
        return cursor.fetchall()[0][0]
       

    # Part 2 Create Indexes [1 points]
    def part_2_a(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_2_a_sql = "CREATE INDEX movie_index ON movies(id)"
        ######################################################################
        return self.execute_query(connection, part_2_a_sql)
    
    def part_2_b(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_2_b_sql = "CREATE INDEX cast_index ON movie_cast(cast_id)"
        ######################################################################
        return self.execute_query(connection, part_2_b_sql)
    
    def part_2_c(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_2_c_sql = "CREATE INDEX cast_bio_index ON cast_bio(cast_id)"
        ######################################################################
        return self.execute_query(connection, part_2_c_sql)
    
    # Part 3 Calculate a Proportion [3 points]
    def part_3(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_3_sql = """SELECT printf('%.2f', CAST(COUNT(id) AS REAL) * 100 /(SELECT COUNT(id) FROM movies))
        FROM movies
        WHERE score >= 7 AND score <= 20;"""
        ######################################################################
        cursor = connection.execute(part_3_sql)
        return cursor.fetchall()[0][0]

    # Part 4 Find the Most Prolific Actors [4 points]
    def part_4(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_4_sql = """
        SELECT cast_name, count(movie_id) as appearance_count
        FROM movie_cast
        WHERE popularity > 10
        GROUP BY cast_id, cast_name
        ORDER BY appearance_count DESC, cast_name
        LIMIT 5;
        """
        ######################################################################
        cursor = connection.execute(part_4_sql)
        return cursor.fetchall()

    # Part 5 Find the Highest Scoring Movies With the Least Amount of Cast [4 points]
    def part_5(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_5_sql = """
        SELECT title as movie_title, printf('%.2f', score), count(cast_id) as cast_count
        FROM movies INNER JOIN movie_cast on movies.id = movie_cast.movie_id
        GROUP BY movies.id
        ORDER BY score DESC, cast_count, movie_title
        LIMIT 5;
        """
        ######################################################################
        cursor = connection.execute(part_5_sql)
        return cursor.fetchall()
    
    # Part 6 Get High Scoring Actors [4 points]
    def part_6(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_6_sql = """
        SELECT cast_id, cast_name, printf('%.2f', AVG(score)) AS average_score
        FROM (
            SELECT movie_cast.cast_id, movie_cast.cast_name, movies.id, movies.score
            FROM movie_cast
            INNER JOIN movies ON movies.id = movie_cast.movie_id
        ) AS movie_scores
        WHERE movie_scores.score >= 25
        GROUP BY cast_id, cast_name
        HAVING count(id) >= 3
        ORDER BY AVG(score) DESC, cast_name
        LIMIT 10;
        """
        ######################################################################
        cursor = connection.execute(part_6_sql)
        return cursor.fetchall()

    # Part 7 Creating Views [6 points]
    def part_7(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_7_sql = """
        CREATE VIEW good_collaboration(cast_member_id1, cast_member_id2, movie_count, average_movie_score) AS
        SELECT mc1.cast_id AS cast_member_id1, mc2.cast_id AS cast_member_id2, count(mc1.movie_id) AS movie_count, printf('%.2f', avg(movies.score)) AS average_movie_score
        FROM movie_cast mc1 INNER JOIN movie_cast mc2 ON mc1.movie_id = mc2.movie_id AND mc1.cast_id < mc2.cast_id 
        INNER JOIN movies on mc1.movie_id = movies.id
        GROUP BY cast_member_id1, cast_member_id2
        HAVING movie_count >= 2 AND AVG(movies.score) >= 40;
        """
        ######################################################################
        return self.execute_query(connection, part_7_sql)
    
    def part_8(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_8_sql = """
        SELECT cast_member_id, cast_name, printf('%.2f', AVG(average_movie_score)) AS collaboration_score
        FROM (
            SELECT cast_member_id1 AS cast_member_id, average_movie_score
            FROM good_collaboration
            UNION ALL
            SELECT cast_member_id2 AS cast_member_id, average_movie_score
            FROM good_collaboration
        ) AS combined_cast_members INNER JOIN cast_bio ON combined_cast_members.cast_member_id = cast_bio.cast_id
        GROUP BY cast_member_id, cast_name
        ORDER BY AVG(average_movie_score) DESC, cast_name
        LIMIT 5;
        """
        ######################################################################
        cursor = connection.execute(part_8_sql)
        return cursor.fetchall()
    
    # Part 9 FTS [4 points]
    def part_9_a(self,connection,path):
        ############### EDIT SQL STATEMENT ###################################
        part_9_a_sql = """
        CREATE VIRTUAL TABLE movie_overview USING fts4(
        id INTEGER,
        overview TEXT
        );
        """
        ######################################################################
        connection.execute(part_9_a_sql)
        ############### CREATE IMPORT CODE BELOW ############################
        with open(path, mode='r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)
            for line in csv_reader:
                command = f"INSERT INTO movie_overview VALUES({self.parse_csv_line(line)});"
                self.execute_query(connection, command)
        ######################################################################
        sql = "SELECT COUNT(id) FROM movie_overview;"
        cursor = connection.execute(sql)
        return cursor.fetchall()[0][0]
        
    def part_9_b(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_9_b_sql = "SELECT count(id) FROM movie_overview WHERE overview MATCH 'fight';"
        ######################################################################
        cursor = connection.execute(part_9_b_sql)
        return cursor.fetchall()[0][0]
    
    def part_9_c(self,connection):
        ############### EDIT SQL STATEMENT ###################################
        part_9_c_sql = "SELECT count(id) FROM movie_overview WHERE overview MATCH 'space NEAR/5 program'"
        ######################################################################
        cursor = connection.execute(part_9_c_sql)
        return cursor.fetchall()[0][0]


if __name__ == "__main__":
    
    ########################### DO NOT MODIFY THIS SECTION ##########################
    #################################################################################
    if SHOW == True:
        sample = Sample()
        sample.sample()

    print('\033[32m' + "Q2 Output: " + '\033[m')
    db = HW2_sql()
    try:
        conn = db.create_connection("Q2")
    except:
        print("Database Creation Error")

    try:
        conn.execute("DROP TABLE IF EXISTS movies;")
        conn.execute("DROP TABLE IF EXISTS movie_cast;")
        conn.execute("DROP TABLE IF EXISTS cast_bio;")
        conn.execute("DROP VIEW IF EXISTS good_collaboration;")
        conn.execute("DROP TABLE IF EXISTS movie_overview;")
    except Exception as e:
        print("Error in Table Drops")
        print(e)

    try:
        print('\033[32m' + "part 1.a.i: " + '\033[m' + str(db.part_1_a_i(conn)))
        print('\033[32m' + "part 1.a.ii: " + '\033[m' + str(db.part_1_a_ii(conn)))
    except Exception as e:
         print("Error in Part 1.a")
         print(e)

    try:
        print('\033[32m' + "Row count for Movies Table: " + '\033[m' + str(db.part_1_b_movies(conn,"data/movies.csv")))
        print('\033[32m' + "Row count for Movie Cast Table: " + '\033[m' + str(db.part_1_b_movie_cast(conn,"data/movie_cast.csv")))
    except Exception as e:
        print("Error in part 1.b")
        print(e)

    try:
        print('\033[32m' + "Row count for Cast Bio Table: " + '\033[m' + str(db.part_1_c(conn)))
    except Exception as e:
        print("Error in part 1.c")
        print(e)

    try:
        print('\033[32m' + "part 2.a: " + '\033[m' + db.part_2_a(conn))
        print('\033[32m' + "part 2.b: " + '\033[m' + db.part_2_b(conn))
        print('\033[32m' + "part 2.c: " + '\033[m' + db.part_2_c(conn))
    except Exception as e:
        print("Error in part 2")
        print(e)

    try:
        print('\033[32m' + "part 3: " + '\033[m' + str(db.part_3(conn)))
    except Exception as e:
        print("Error in part 3")
        print(e)

    try:
        print('\033[32m' + "part 4: " + '\033[m')
        for line in db.part_4(conn):
            print(line[0],line[1])
    except Exception as e:
        print("Error in part 4")
        print(e)

    try:
        print('\033[32m' + "part 5: " + '\033[m')
        for line in db.part_5(conn):
            print(line[0],line[1],line[2])
    except Exception as e:
        print("Error in part 5")
        print(e)

    try:
        print('\033[32m' + "part 6: " + '\033[m')
        for line in db.part_6(conn):
            print(line[0],line[1],line[2])
    except Exception as e:
        print("Error in part 6")
        print(e)
    
    try:
        print('\033[32m' + "part 7: " + '\033[m' + str(db.part_7(conn)))
        print("\033[32mRow count for good_collaboration view:\033[m", conn.execute("select count(*) from good_collaboration").fetchall()[0][0])
        print('\033[32m' + "part 8: " + '\033[m')
        for line in db.part_8(conn):
            print(line[0],line[1],line[2])
    except Exception as e:
        print("Error in part 7 and/or 8")
        print(e)

    try:   
        print('\033[32m' + "part 9.a: " + '\033[m'+ str(db.part_9_a(conn,"data/movie_overview.csv")))
        print('\033[32m' + "Count 9.b: " + '\033[m' + str(db.part_9_b(conn)))
        print('\033[32m' + "Count 9.c: " + '\033[m' + str(db.part_9_c(conn)))
    except Exception as e:
        print("Error in part 9")
        print(e)

    conn.close()
    #################################################################################
    #################################################################################
  
