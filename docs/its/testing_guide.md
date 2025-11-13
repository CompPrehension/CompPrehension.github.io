# Руководство и советы по тестированию доменов

1. Полностью зеленые тесты теперь становятся **ОБЯЗАТЕЛЬНЫМ** требованием перед мерджем в основную ветку. Пока пайплайн не настроен, это будет проверяться вручную. Поэтому, пожалуйста, не забывайте запускать тесты перед окончательным пушем. В будущем это будет автоматизировано.

2. В коде **запрещены** альтернативные точки входа (альтернативные `main` методы). Если нужно что-мелкое проверить/протестить по ходу разработки, то создавайте под это тест.

3. Тесты находятся в модуле `server`. Для тестов используется движок `JUnit`

4. В системе настроены два вида тестов: **unit** и **integration**:

    - **unit test**. Использовать, когда либо взаимодействие с бд не нужно, либо это взаимодействие можно легко замокать (_mock_). Представляет из себя просто класс, содержащий методы, аннотированные атрибутом `@Test`. Пример:

    ```java
    public class TermMappingTest {
        TermMapping tm;

        @BeforeEach // запускается перед каждым тестом
        public void setUp() throws Exception {
            tm = new TermMapping();
        }

        @Test
        public void test_termToResource() {
            // Expand simple name as local, or prefixed name as special
            String ns = TermMapping.BASE_URI_DEFAULT + "#";

            assertEquals(ns + "a", tm.termToResource("a").getURI());
            assertEquals(ns + "a", tm.termToResource(":a").getURI());
            assertEquals(ns + "a", tm.termToResource("my:a").getURI());
            assertEquals(RDF.type.getURI(), tm.termToResource("rdf:type").getURI());
            assertEquals(OWL.Class.getURI(), tm.termToResource("owl:Class").getURI());
        }
    }

    ```

    - **integration tests**. Использовать, когда нужно взаимодействие с бд (или другими внешними компонентами). От unit тестов отличается тем, класс
    содержит аннотации `@SpringBootTest` и `@ActiveProfiles("test")`, которые запускают тест в контексте Spring-приложения. Пример:

    ```java
    @SpringBootTest         // Запуск теста в контексте Spring приложения
    @ActiveProfiles("test") // Использование профиля test (application-test.properties)
    @Transactional          // Откатывает изменения в бд после выполнения теста
    public class Test {
        @Autowired
        private DomainRepository domainRepository;

        private void createTestData() {
            var newDomain = new DomainEntity();
            newDomain.setName("##TEST_TRANSACTION_ROLLBACK##");
            newDomain.setShortName("##TEST_TRANSACTION_ROLLBACK##");
            newDomain.setVersion("1");
            newDomain.setOptions(new DomainOptionsEntity());

            domainRepository.save(newDomain);
        }

        @Test
        public void fakeDomainExists() {
            // Create test domain
            createTestData();

            var domains = domainRepository.findAll();
            var domainNames = domains.stream()
                    .map(DomainEntity::getName)
                    .collect(Collectors.toSet());

            assertEquals(5, domainNames.size(), "There are 5 domains in the database");
            assertTrue(domainNames.contains("##TEST_TRANSACTION_ROLLBACK##"));
            assertTrue(domainNames.contains("ControlFlowStatementsDomain"));
            assertTrue(domainNames.contains("ControlFlowStatementsDTDomain"));
            assertTrue(domainNames.contains("ProgrammingLanguageExpressionDomain"));
            assertTrue(domainNames.contains("ProgrammingLanguageExpressionDTDomain"));
        }
    }
    ```

## Особенности работы с интеграционными тестами

1. Конфигурация окружения для интеграционных тестов находится в файле `application-test.properties`. Этот файл является дополнением к `application.properties` основного приложения. Поэтому, если в `application.properties` есть какие-то настройки, которые необходимо переопределить для тестов, то их нужно указать в `application-test.properties`.

2. Для интеграционных тестов используется реальная база данных (mysql). Для этого в `application-test.properties` должны быть переопределены настройки для подключения.
При этом, в этой базе данных должны быть созданы все необходимые таблицы. Для этого можно запустить приложение на чистой базе данных, и liquibase накатит все миграции (либо использовать дамп).

3. Перед стартом всех интеграционных скриптов автоматически накатывается скрипт `data.sql`. В этом файле можно указать какие-то общие данные, которые необходимы для нормальной работы всех интеграционных тестов. Например, можно создать какие-то общие сущности, которые будут использоваться во всех тестах. Скрипт должен быть **`идемпотентным`**, то есть его можно запускать несколько раз, и он не должен создавать дубликаты данных. Все созданные данные должны быть удаляемы с помощью скрипта `data-delete.sql`.

4. Каждый интеграционный тест должен быть **НЕЗАВИСИМЫМ** как от других тестов, так и от вашего окружения. Это означает, что тест не должен зависеть от данных, созданных в других тестах, либо данных, существующих чисто в вашей бд. Поэтому, для каждого теста нужно создавать все необходимые для него данные и после выполнения их подчищать. Проще всего для этого использовать аннотацию `@Transactional` (на уровне класса, см. пример выше). Она позволяет откатывать изменения в базе данных после выполнения теста. Таким образом, база данных всегда остается в том же состоянии, что и до выполнения теста. В качестве альтернативы `@Transactional` можно использовать методы, аннотированные `@Before*` и `@After*`. В `@Before*` создаются данные, а в `@After*` — удаляются.

5. Если есть сомнения по реализации, то стоит посмотреть на примеры в уже существующих тестах. Unit-тесты всегда более предпочтительнее, чем интеграционные, так как работают сильно быстрее.

